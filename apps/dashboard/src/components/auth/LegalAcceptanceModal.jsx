import React, { useState, useEffect } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Shield, FileText } from 'lucide-react';

export function LegalAcceptanceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: existingAcceptances } = useQuery({
    queryKey: ['legal-acceptances', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_acceptances')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (user && existingAcceptances) {
      const hasTerms = existingAcceptances.some(a => a.document_type === 'terms_of_service');
      const hasPrivacy = existingAcceptances.some(a => a.document_type === 'privacy_policy');

      if (!hasTerms || !hasPrivacy) {
        setIsOpen(true);
      }
    }
  }, [user, existingAcceptances]);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const acceptances = [
        { user_id: user.id, document_type: 'terms_of_service', document_version: '1.0' },
        { user_id: user.id, document_type: 'privacy_policy', document_version: '1.0' },
      ];

      const { error } = await supabase
        .from('legal_acceptances')
        .insert(acceptances);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-acceptances'] });
      setIsOpen(false);
    },
  });

  const handleAccept = () => {
    if (agreedToTerms) {
      acceptMutation.mutate();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Welcome to FamilyCare.Help
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-slate-600">
            Before you continue, please review and accept our legal agreements.
          </p>

          <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
            <Link
              to={createPageUrl('TermsOfService')}
              target="_blank"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </Link>
            <Link
              to={createPageUrl('PrivacyPolicy')}
              target="_blank"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </Link>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="terms-agreement"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
            />
            <label
              htmlFor="terms-agreement"
              className="text-sm text-slate-700 cursor-pointer leading-relaxed"
            >
              I have read and agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!agreedToTerms || acceptMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {acceptMutation.isPending ? 'Processing...' : 'Accept and Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LegalAcceptanceModal;
