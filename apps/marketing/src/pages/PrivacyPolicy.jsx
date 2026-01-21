import { Shield } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      icon={Shield}
      lastUpdated="January 14, 2026"
    >
      <section>
        <h2>Information We Collect</h2>
        <ul>
          <li>Account information (name, email, phone)</li>
          <li>Loved One Profiles (non-medical coordination data)</li>
          <li>Subscription and billing data (processed securely via third-party payment processors)</li>
          <li>App usage and device data</li>
          <li>We may log the time, device details, and IP address when you accept legal terms to help prevent fraud and maintain compliance records</li>
        </ul>
      </section>

      <section>
        <h2>What We Do Not Collect</h2>
        <ul>
          <li>No Protected Health Information (PHI)</li>
          <li>No medical records</li>
          <li>No diagnosis or treatment data</li>
        </ul>
      </section>

      <section>
        <h2>HIPAA Status</h2>
        <div className="callout">
          <p>
            <strong>FamilyCare.Help is not a Covered Entity or Business Associate</strong> as defined under the Health Insurance Portability and Accountability Act (HIPAA).
          </p>
          <p>
            The platform does not request, store, or process Protected Health Information (PHI).
          </p>
          <p>
            If FamilyCare.Help later integrates with licensed healthcare providers, insurers, or electronic health record systems, additional HIPAA-compliant agreements, disclosures, and safeguards will be implemented as required by law.
          </p>
        </div>
      </section>

      <section>
        <h2>Data Use</h2>
        <p>We use data to:</p>
        <ul>
          <li>Operate the platform</li>
          <li>Provide reminders and coordination tools</li>
          <li>Process subscriptions</li>
          <li>Improve security and performance</li>
        </ul>
      </section>

      <section>
        <h2>Data Sharing</h2>
        <p>Limited to:</p>
        <ul>
          <li>Payment processors (e.g., Stripe)</li>
          <li>Infrastructure providers</li>
          <li>Legal authorities when required</li>
        </ul>
      </section>

      <section>
        <h2>User Rights</h2>
        <p>
          You may access, update, or delete your data at any time through your account settings.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@familycare.help
        </p>
      </section>
    </LegalPageLayout>
  );
}
