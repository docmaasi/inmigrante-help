import { FileText } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function TermsOfService() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      icon={FileText}
      lastUpdated="January 14, 2026"
    >
      <section>
        <h2>Eligibility</h2>
        <p>Users must be 18 years or older to use FamilyCare.Help.</p>
      </section>

      <section>
        <h2>Account Responsibility</h2>
        <p>
          You are responsible for all activity under your account and the
          accuracy of information entered into the platform.
        </p>
      </section>

      <section>
        <h2>Subscriptions</h2>
        <ul>
          <li>Monthly and annual plans available</li>
          <li>Additional Loved One Profiles may incur additional fees</li>
          <li>Subscriptions auto-renew unless canceled</li>
          <li>No refunds except where required by law</li>
        </ul>
      </section>

      <section>
        <h2>Acceptable Use</h2>
        <p>
          Users may not misuse the platform, impersonate others, or attempt to
          disrupt services.
        </p>
      </section>

      <section>
        <h2>Intellectual Property</h2>
        <p>
          All content and software are owned by FamilyCare.Help and are
          protected by copyright, trademark, and other intellectual property
          laws.
        </p>
      </section>

      <section>
        <h2>Limitation of Liability</h2>
        <p>
          FamilyCare.Help is not liable for indirect or consequential damages.
          Total liability is limited to fees paid in the last 12 months.
        </p>
      </section>

      <section>
        <h2>Governing Law</h2>
        <p>
          These terms are governed by U.S. law and the state of business
          registration.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about the Terms of Service should be sent to{" "}
          <a href="mailto:admin@familycare.help">admin@familycare.help</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
