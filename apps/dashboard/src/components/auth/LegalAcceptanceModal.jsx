import React, { useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, FileText, ExternalLink, Loader2 } from 'lucide-react';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'https://familycare.help';
const LEGAL_ACCEPTED_KEY = 'legal_accepted_v1';

export function LegalAcceptanceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Skip DB query entirely if localStorage says already accepted
  const alreadyAcceptedLocally = localStorage.getItem(LEGAL_ACCEPTED_KEY) === 'true';

  const { data: existingAcceptances, error: queryError } = useQuery({
    queryKey: ['legal-acceptances', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_acceptances')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !alreadyAcceptedLocally,
  });

  useEffect(() => {
    // If already accepted on this device, never show the modal
    if (alreadyAcceptedLocally) return;

    // If the query itself fails (table doesn't exist), don't show modal
    if (queryError) {
      console.error('Legal acceptances query failed:', queryError);
      return;
    }

    if (user && existingAcceptances) {
      const hasTerms = existingAcceptances.some(a => a.document_type === 'terms_of_service');
      const hasPrivacy = existingAcceptances.some(a => a.document_type === 'privacy_policy');

      if (!hasTerms || !hasPrivacy) {
        setIsOpen(true);
      } else {
        // DB says accepted — sync to localStorage for future logins
        localStorage.setItem(LEGAL_ACCEPTED_KEY, 'true');
      }
    }
  }, [user, existingAcceptances, queryError, alreadyAcceptedLocally]);

  const handleAccept = async () => {
    if (!agreedToTerms) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('legal_acceptances')
        .upsert(
          [
            { user_id: user.id, document_type: 'terms_of_service', document_version: '1.0' },
            { user_id: user.id, document_type: 'privacy_policy', document_version: '1.0' },
          ],
          { onConflict: 'user_id,document_type' }
        );

      if (error) console.error('Legal acceptance save error:', error);
      queryClient.invalidateQueries({ queryKey: ['legal-acceptances'] });
    } catch (err) {
      console.error('Legal acceptance error:', err);
    }

    // Remember acceptance on this device so modal never shows again
    localStorage.setItem(LEGAL_ACCEPTED_KEY, 'true');

    // Always close the modal — don't trap the user
    setIsOpen(false);
    setIsSaving(false);
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
            <a
              href={`${MARKETING_URL}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`${MARKETING_URL}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </a>
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
            disabled={!agreedToTerms || isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Accept and Continue'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LegalAcceptanceModal;
