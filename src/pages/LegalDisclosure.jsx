import React from 'react';
import { Scale } from 'lucide-react';

export default function LegalDisclosure() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Legal Disclosure</h1>
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
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Platform Purpose</h2>
              <p>
                FamilyCare.Help is a care coordination platform designed to help families and caregivers organize, 
                communicate, and manage care-related tasks and information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Not Medical Advice</h2>
              <p>
                The information and services provided through FamilyCare.Help are for organizational and coordination 
                purposes only and do not constitute medical advice, diagnosis, or treatment. Always seek the advice of 
                your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">User Responsibility</h2>
              <p>
                Users are solely responsible for the accuracy and appropriateness of information they enter into the platform. 
                FamilyCare.Help does not verify, endorse, or guarantee the accuracy of user-provided information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, FamilyCare.Help shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from your use of or inability to use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact Information</h2>
              <p>
                For legal inquiries, please contact us at legal@familycare.help
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}