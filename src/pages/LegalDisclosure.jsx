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
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Platform Purpose</h2>
              <p>
                FamilyCare.Help provides a digital platform to help families organize, coordinate, and document care 
                activities for seniors and individuals with disabilities.
              </p>
              <p className="mt-4">
                <strong>FamilyCare.Help does not provide:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Medical care</li>
                <li>Legal advice</li>
                <li>Financial services</li>
                <li>Emergency services</li>
              </ul>
              <p className="mt-4">
                All information and tools are provided for organizational and informational purposes only.
              </p>
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mt-4">
                <p className="font-semibold text-red-900">
                  ⚠️ In emergencies, call 911 or your local emergency number.
                </p>
              </div>
            </section>

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
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">User Responsibility</h2>
              <p>
                You are responsible for all activity under your account and the accuracy of information entered into the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Limitation of Liability</h2>
              <p>
                FamilyCare.Help is not liable for indirect or consequential damages. Total liability is limited to fees paid in the last 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Governing Law</h2>
              <p>
                These terms are governed by U.S. law and the state of business registration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact Information</h2>
              <p>
                For legal inquiries, please contact us at admin@familycare.help
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}