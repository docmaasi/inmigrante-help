import React from 'react';
import { Cookie } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Cookie Policy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
            <p className="text-sm text-slate-500">Last Updated: January 14, 2026</p>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Types of Cookies We Use</h2>
              <p>FamilyCare.Help uses the following types of cookies:</p>
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Essential Cookies</h3>
                  <p>Required for the platform to function properly and cannot be disabled.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Performance Cookies</h3>
                  <p>Help us understand how visitors interact with our platform by collecting anonymous information.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Preference Cookies</h3>
                  <p>Remember your preferences and provide enhanced, personalized features.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Analytics Cookies</h3>
                  <p>Used to operate and improve the platform's functionality and user experience.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Managing Cookies</h2>
              <p>
                You may manage cookies via your browser settings. Disabling cookies may limit functionality of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at privacy@familycare.help
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}