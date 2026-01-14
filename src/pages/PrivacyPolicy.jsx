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
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">HIPAA Status Statement</h2>
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
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Information We Collect</h2>
              <p>
                We collect information you provide directly to us, including when you create an account, use our services, 
                communicate with us, or participate in surveys or promotions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to communicate with you, 
                and to protect the security and integrity of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. You may also have the right 
                to restrict or object to certain processing of your data.
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