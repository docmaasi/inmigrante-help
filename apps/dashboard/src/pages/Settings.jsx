import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, RefreshCw, Mail, CreditCard, ExternalLink, Receipt, Trash2, AlertTriangle, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();

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

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl: window.location.href }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      toast.error('Unable to open billing portal. Please try again or contact support.');
      setIsLoadingPortal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      // Call Edge Function to cancel subscription and mark account for deletion
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { reason: 'User requested account deletion' }
      });

      if (error) throw error;

      toast.success('Your subscription has been canceled and account deletion requested.');

      // Sign out the user
      await signOut();
    } catch (error) {
      console.error('Deletion request failed:', error);
      toast.error('Failed to process account deletion. Please contact support at familycarehelp@mail.com');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Subscription Management Section */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>
                Manage your subscription, payment methods, and view billing history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  Your subscription is managed through Stripe's secure billing portal. Click the button below to:
                </p>
                <ul className="text-sm text-teal-700 mt-2 ml-4 list-disc space-y-1">
                  <li>View and update your payment method</li>
                  <li>See your billing history and download invoices</li>
                  <li>Add or remove additional family members ($5/month each)</li>
                  <li>Change or cancel your subscription</li>
                </ul>
              </div>

              <Button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto h-auto"
              >
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <SettingsIcon className="w-5 h-5" />
                    Manage Your Subscription
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500">
                You'll be securely redirected to Stripe to manage your subscription, payment methods, and billing history.
              </p>
            </CardContent>
          </Card>

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

          {/* Account Deletion Section */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Cancel your subscription and schedule account deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 60-day retention notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">60-Day Data Retention</p>
                    <p>Your data will be archived for 60 days. During this period, you can reactivate your subscription and restore all your data. After 60 days, data will be permanently deleted.</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-2">What happens when you delete:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Your subscription will be canceled immediately</li>
                      <li>All team members will lose access</li>
                      <li>Data is archived for 60 days (can be restored if you re-subscribe)</li>
                      <li>After 60 days, all data is permanently deleted</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Request Account Deletion
              </Button>
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

      {/* Account Deletion Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Delete Your Account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">60-day recovery period:</span> Your data will be archived for 60 days. If you change your mind, simply re-subscribe and your data will be restored.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                Your subscription will be canceled immediately and you'll be signed out.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                To confirm, type <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">DELETE</span> below:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                placeholder="Type DELETE to confirm"
                className="font-mono"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
