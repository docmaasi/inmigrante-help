import { Scale } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function LegalDisclosure() {
  return (
    <LegalPageLayout
      title="Legal Disclosure"
      icon={Scale}
      lastUpdated="January 14, 2026"
    >
      <section>
        <h2>Platform Purpose</h2>
        <p>
          FamilyCare.Help provides a digital platform to help families organize,
          coordinate, and document care activities for seniors and individuals
          with disabilities.
        </p>
        <p>
          <strong>FamilyCare.Help does not provide:</strong>
        </p>
        <ul>
          <li>Medical care</li>
          <li>Legal advice</li>
          <li>Financial services</li>
          <li>Emergency services</li>
        </ul>
        <p>
          All information and tools are provided for organizational and
          informational purposes only.
        </p>
        <div className="callout">
          <p>
            <strong>In emergencies, call 911 or your local emergency number.</strong>
          </p>
        </div>
      </section>

      <section>
        <h2>HIPAA Status Statement</h2>
        <div className="callout">
          <p>
            <strong>
              FamilyCare.Help is not a Covered Entity or Business Associate
            </strong>{" "}
            as defined under the Health Insurance Portability and Accountability
            Act (HIPAA).
          </p>
          <p>
            The platform does not request, store, or process Protected Health
            Information (PHI).
          </p>
          <p>
            If FamilyCare.Help later integrates with licensed healthcare
            providers, insurers, or electronic health record systems, additional
            HIPAA-compliant agreements, disclosures, and safeguards will be
            implemented as required by law.
          </p>
        </div>
      </section>

      <section>
        <h2>User Responsibility</h2>
        <p>
          You are responsible for all activity under your account and the
          accuracy of information entered into the platform.
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
        <h2>Contact Information</h2>
        <p>
          For legal inquiries, please contact us at{" "}
          <a href="mailto:admin@familycare.help">admin@familycare.help</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
