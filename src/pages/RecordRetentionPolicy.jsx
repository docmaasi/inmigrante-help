import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';

export default function RecordRetentionPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Record Retention Policy After Cancellation</CardTitle>
                <p className="text-blue-100 text-sm mt-1">FamilyCare.Help</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <p className="text-slate-700 leading-relaxed">
              When a subscription to FamilyCare.Help is canceled, user data and records are handled as follows:
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                Retention Periods
              </h2>
              <p className="text-slate-700 leading-relaxed">
                All account data, including care notes, schedules, documents, activity logs, and uploaded files,
                will be retained based on your account type:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li><strong>Paid subscribers who cancel:</strong> Data is retained for sixty (60) days following the cancellation date.</li>
                <li><strong>Free trial users who do not subscribe:</strong> Data is retained for ten (10) days after the trial expires.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                Access During Retention
              </h2>
              <p className="text-slate-700 leading-relaxed">
                During the retention period, access to the account and its records is not guaranteed.
                Data is preserved for recovery purposes only.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                Resubscribing During Retention
              </h2>
              <p className="text-slate-700 leading-relaxed">
                If the subscription is reactivated within the retention period, all previously stored
                records will be restored in full, with no loss of data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                After the Retention Period
              </h2>
              <p className="text-slate-700 leading-relaxed">
                After the retention period expires, records may be permanently deleted. Once deletion occurs,
                data cannot be recovered, and FamilyCare.Help makes no guarantees regarding data availability or restoration.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                No Automatic Legal or Medical Hold
              </h2>
              <p className="text-slate-700 leading-relaxed">
                FamilyCare.Help does not automatically place legal, medical, or compliance holds on canceled accounts. 
                Users are responsible for exporting or downloading records prior to cancellation if needed for personal, 
                caregiving, medical, or legal purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                Policy Updates
              </h2>
              <p className="text-slate-700 leading-relaxed">
                This retention policy may be updated as necessary to comply with legal, regulatory, or operational requirements.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                For questions about this policy, please contact us through the Settings page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}