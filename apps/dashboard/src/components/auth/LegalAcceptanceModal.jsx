import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Shield, FileText } from 'lucide-react';

export default function LegalAcceptanceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: existingAcceptances } = useQuery({
    queryKey: ['legalAcceptances', user?.email],
    queryFn: () => base44.entities.LegalAcceptance.filter({ user_email: user.email }),
    enabled: !!user?.email,
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
      await logAcceptance(user.email, 'terms_of_service');
      await logAcceptance(user.email, 'privacy_policy');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalAcceptances'] });
      setIsOpen(false);
    },
  });

  const logAcceptance = async (userEmail, documentType) => {
    await base44.entities.LegalAcceptance.create({
      user_email: userEmail,
      document_type: documentType,
      document_version: '1.0',
      acceptance_date: new Date().toISOString(),
    });
  };

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