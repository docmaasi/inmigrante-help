import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <p className="text-sm text-slate-500">Last Updated: January 14, 2026</p>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Eligibility</h2>
              <p>
                Users must be 18 years or older to use FamilyCare.Help.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Account Responsibility</h2>
              <p>
                You are responsible for all activity under your account and the accuracy of information entered into the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Subscriptions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Monthly and annual plans available</li>
                <li>Additional Loved One Profiles may incur additional fees</li>
                <li>Subscriptions auto-renew unless canceled</li>
                <li>No refunds except where required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Acceptable Use</h2>
              <p>
                Users may not misuse the platform, impersonate others, or attempt to disrupt services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Intellectual Property</h2>
              <p>
                All content and software are owned by FamilyCare.Help and are protected by copyright, trademark, 
                and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Limitation of Liability</h2>
              <p>
                FamilyCare.Help is not liable for indirect or consequential damages. Total liability is limited to 
                fees paid in the last 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Governing Law</h2>
              <p>
                These terms are governed by U.S. law and the state of business registration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact</h2>
              <p>
                Questions about the Terms of Service should be sent to terms@familycare.help
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}