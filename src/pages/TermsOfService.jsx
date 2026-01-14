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
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Acceptance of Terms</h2>
              <p>
                By accessing and using FamilyCare.Help, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account. You agree to notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Acceptable Use</h2>
              <p>
                You agree to use FamilyCare.Help only for lawful purposes and in a manner that does not infringe 
                the rights of others or restrict their use and enjoyment of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Intellectual Property</h2>
              <p>
                All content, features, and functionality of FamilyCare.Help are owned by us and are protected by 
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Service Modifications</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of FamilyCare.Help at any time 
                without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Termination</h2>
              <p>
                We may terminate or suspend your access to FamilyCare.Help immediately, without prior notice, 
                for any reason, including breach of these Terms.
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