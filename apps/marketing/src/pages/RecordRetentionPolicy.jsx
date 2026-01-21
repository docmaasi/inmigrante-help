import { Archive } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function RecordRetentionPolicy() {
  return (
    <LegalPageLayout
      title="Record Retention Policy"
      icon={Archive}
      lastUpdated="January 2025"
    >
      <p>
        When a subscription to FamilyCare.Help is canceled, user data and
        records are handled as follows:
      </p>

      <section>
        <h2>90-Day Retention Period</h2>
        <p>
          All account data, including care notes, schedules, documents, activity
          logs, and uploaded files, will be retained for up to ninety (90) days
          following the cancellation date.
        </p>
      </section>

      <section>
        <h2>Access During Retention</h2>
        <p>
          During the 90-day retention period, access to the account and its
          records is not guaranteed. Data is preserved for recovery purposes
          only.
        </p>
      </section>

      <section>
        <h2>Renewal Within 90 Days</h2>
        <p>
          If the subscription is reactivated within ninety (90) days of
          cancellation, all previously stored records will be restored in full,
          with no loss of data.
        </p>
      </section>

      <section>
        <h2>After 90 Days</h2>
        <p>
          After the 90-day retention period expires, records may be permanently
          deleted. Once deletion occurs, data cannot be recovered, and
          FamilyCare.Help makes no guarantees regarding data availability or
          restoration.
        </p>
      </section>

      <section>
        <h2>No Automatic Legal or Medical Hold</h2>
        <p>
          FamilyCare.Help does not automatically place legal, medical, or
          compliance holds on canceled accounts. Users are responsible for
          exporting or downloading records prior to cancellation if needed for
          personal, caregiving, medical, or legal purposes.
        </p>
      </section>

      <section>
        <h2>Policy Updates</h2>
        <p>
          This retention policy may be updated as necessary to comply with
          legal, regulatory, or operational requirements.
        </p>
      </section>

      <div className="callout">
        <p>
          For questions about this policy, please contact us through the
          Settings page.
        </p>
      </div>
    </LegalPageLayout>
  );
}
