import { Archive, Mail } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function RecordRetentionPolicy() {
  return (
    <LegalPageLayout
      title="Record Retention & Deletion Notice"
      icon={Archive}
      lastUpdated="January 1, 2026"
    >
      <section>
        <h2>Account Cancellation or Non-Payment</h2>
        <p>
          If your FamilyCare.Help subscription is canceled or becomes inactive due to non-payment,
          your account will enter a 60-day retention period.
        </p>
        <p><strong>During this 60-day period:</strong></p>
        <ul>
          <li>Your data remains securely stored</li>
          <li>Your account is read-only and access may be limited</li>
          <li>You may reactivate your subscription to restore full access</li>
          <li>No new data can be added unless the account is reactivated</li>
        </ul>
      </section>

      <section>
        <h2>Data Deletion After 60 Days</h2>
        <p><strong>After 60 days from cancellation or non-payment:</strong></p>
        <ul>
          <li>Your account data may be permanently deleted</li>
          <li>Deleted data cannot be recovered</li>
          <li>FamilyCare.Help is not responsible for data loss after this period</li>
        </ul>
        <p><strong>This includes, but is not limited to:</strong></p>
        <ul>
          <li>Loved One Profiles</li>
          <li>Care notes and logs</li>
          <li>Uploaded files and documents</li>
          <li>Communication records</li>
          <li>App settings and preferences</li>
        </ul>
        <p>
          Deletion may occur automatically or during routine system maintenance.
        </p>
      </section>

      <section>
        <h2>Early Deletion Requests</h2>
        <p>
          You may request early deletion of your data at any time during the 60-day period by contacting:
        </p>
        <div className="callout">
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <a href="mailto:admin@familycare.help" className="text-teal-600 hover:text-teal-700">
              admin@familycare.help
            </a>
          </p>
        </div>
        <p>
          Once early deletion is completed, data cannot be restored, even if you later resubscribe.
        </p>
      </section>

      <section>
        <h2>Legal, Compliance & Security Holds</h2>
        <p>
          Certain information may be retained beyond 60 days only if required to:
        </p>
        <ul>
          <li>Comply with legal obligations</li>
          <li>Respond to lawful requests</li>
          <li>Enforce our Terms of Service</li>
          <li>Maintain system security and fraud prevention</li>
        </ul>
        <p>
          Any retained data under these circumstances is restricted, minimized, and securely stored.
        </p>
      </section>

      <section>
        <h2>No Medical Record Guarantee</h2>
        <p>
          FamilyCare.Help is a care coordination and documentation platform, not a medical provider.
        </p>
        <ul>
          <li>We are not a medical records custodian</li>
          <li>We do not guarantee long-term record storage</li>
          <li>Users are responsible for downloading or exporting any records they wish to retain</li>
        </ul>
      </section>

      <section>
        <h2>User Responsibility</h2>
        <p><strong>It is your responsibility to:</strong></p>
        <ul>
          <li>Download important information before cancellation</li>
          <li>Maintain personal copies of any records you may need</li>
          <li>Reactivate your account within the 60-day retention window if continued access is required</li>
        </ul>
      </section>

      <section>
        <h2>Policy Updates</h2>
        <p>
          FamilyCare.Help may update this retention policy to reflect operational, legal, or regulatory changes.
          Continued use of the platform constitutes acceptance of the current policy.
        </p>
      </section>

      <div className="callout">
        <p>
          For questions about this policy, please contact us at{" "}
          <a href="mailto:admin@familycare.help" className="text-teal-600 hover:text-teal-700">
            admin@familycare.help
          </a>
        </p>
      </div>
    </LegalPageLayout>
  );
}
