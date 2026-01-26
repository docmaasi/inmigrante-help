import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, RefreshCw, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

// Current document versions - increment these when legal docs are updated
const CURRENT_VERSIONS = {
  terms_of_service: '1.0',
  privacy_policy: '1.0',
};

export default function Settings() {
  const [showReacceptModal, setShowReacceptModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: acceptances } = useQuery({
    queryKey: ['legalAcceptances', user?.id],
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

  const reacceptMutation = useMutation({
    mutationFn: async () => {
      await supabase.from('legal_acceptances').insert({
        user_id: user.id,
        document_type: 'terms_of_service',
        document_version: CURRENT_VERSIONS.terms_of_service,
        accepted_at: new Date().toISOString(),
      });
      await supabase.from('legal_acceptances').insert({
        user_id: user.id,
        document_type: 'privacy_policy',
        document_version: CURRENT_VERSIONS.privacy_policy,
        accepted_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalAcceptances'] });
      setShowReacceptModal(false);
      setAgreedToTerms(false);
    },
  });

  const needsReacceptance = () => {
    if (!acceptances) return false;

    const termsAcceptance = acceptances
      .filter(a => a.document_type === 'terms_of_service')
      .sort((a, b) => new Date(b.accepted_at) - new Date(a.accepted_at))[0];

    const privacyAcceptance = acceptances
      .filter(a => a.document_type === 'privacy_policy')
      .sort((a, b) => new Date(b.accepted_at) - new Date(a.accepted_at))[0];

    const termsOutdated = !termsAcceptance || termsAcceptance.document_version !== CURRENT_VERSIONS.terms_of_service;
    const privacyOutdated = !privacyAcceptance || privacyAcceptance.document_version !== CURRENT_VERSIONS.privacy_policy;

    return termsOutdated || privacyOutdated;
  };

  const handleReaccept = () => {
    if (agreedToTerms) {
      reacceptMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Legal & Privacy Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Legal & Privacy
              </CardTitle>
              <CardDescription>
                Manage your legal agreements and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Link
                  to={createPageUrl('TermsOfService')}
                  target="_blank"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View Terms of Service
                </Link>
                <Link
                  to={createPageUrl('PrivacyPolicy')}
                  target="_blank"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Shield className="w-4 h-4" />
                  View Privacy Policy
                </Link>
                <Link
                  to={createPageUrl('CookiePolicy')}
                  target="_blank"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View Cookie Policy
                </Link>
                <Link
                  to={createPageUrl('LegalDisclosure')}
                  target="_blank"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  View Legal Disclosure
                </Link>
              </div>

              {needsReacceptance() && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-amber-800">
                      Our Terms of Service or Privacy Policy has been updated. Please review and accept the latest version.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowReacceptModal(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-accept Latest Terms
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help & Support Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />
                Help & Support
              </CardTitle>
              <CardDescription>
                Need assistance? We're here to help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:familycarehelp@mail.com"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <Mail className="w-4 h-4" />
                Contact Support (familycarehelp@mail.com)
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Re-acceptance Modal */}
      <Dialog open={showReacceptModal} onOpenChange={setShowReacceptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-600" />
              Accept Updated Terms
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-slate-600">
              Please review and accept our updated legal agreements.
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <Link
                to={createPageUrl('TermsOfService')}
                target="_blank"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <FileText className="w-4 h-4" />
                Terms of Service (v{CURRENT_VERSIONS.terms_of_service})
              </Link>
              <Link
                to={createPageUrl('PrivacyPolicy')}
                target="_blank"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy (v{CURRENT_VERSIONS.privacy_policy})
              </Link>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="reaccept-terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
              />
              <label
                htmlFor="reaccept-terms"
                className="text-sm text-slate-700 cursor-pointer leading-relaxed"
              >
                I have read and agree to the updated Terms of Service and Privacy Policy
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowReacceptModal(false);
                  setAgreedToTerms(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReaccept}
                disabled={!agreedToTerms || reacceptMutation.isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {reacceptMutation.isPending ? 'Processing...' : 'Accept'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
