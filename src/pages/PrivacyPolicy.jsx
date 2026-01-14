import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <p className="text-sm text-slate-500">Last Updated: January 14, 2026</p>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, phone)</li>
                <li>Loved One Profiles (non-medical coordination data)</li>
                <li>Subscription and billing data (processed securely via third-party payment processors)</li>
                <li>App usage and device data</li>
                <li>We may log the time, device details, and IP address when you accept legal terms to help prevent fraud and maintain compliance records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">What We Do Not Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>No Protected Health Information (PHI)</li>
                <li>No medical records</li>
                <li>No diagnosis or treatment data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">HIPAA Status</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="mb-3">
                  <strong>FamilyCare.Help is not a Covered Entity or Business Associate</strong> as defined under the Health Insurance Portability and Accountability Act (HIPAA).
                </p>
                <p className="mb-3">
                  The platform does not request, store, or process Protected Health Information (PHI).
                </p>
                <p>
                  If FamilyCare.Help later integrates with licensed healthcare providers, insurers, or electronic health record systems, additional HIPAA-compliant agreements, disclosures, and safeguards will be implemented as required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Data Use</h2>
              <p>We use data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Operate the platform</li>
                <li>Provide reminders and coordination tools</li>
                <li>Process subscriptions</li>
                <li>Improve security and performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Data Sharing</h2>
              <p>Limited to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processors (e.g., Stripe)</li>
                <li>Infrastructure providers</li>
                <li>Legal authorities when required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">User Rights</h2>
              <p>
                You may access, update, or delete your data at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@familycare.help
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}