import { MessageSquareQuote } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function TestimonialDisclaimer() {
  return (
    <LegalPageLayout
      title="Testimonial Disclaimer"
      icon={MessageSquareQuote}
      lastUpdated="February 1, 2026"
    >
      <section>
        <h2>About Our Testimonials</h2>
        <p>
          The testimonials shown on FamilyCare.Help represent individual
          experiences and opinions of FamilyCare.Help users.
        </p>
      </section>

      <section>
        <h2>Not Medical Advice</h2>
        <div className="callout">
          <p>
            <strong>These testimonials do not constitute:</strong>
          </p>
          <ul>
            <li>Medical advice</li>
            <li>Diagnosis</li>
            <li>Treatment recommendations</li>
          </ul>
          <p>
            FamilyCare.Help does not provide healthcare services. Always consult
            with qualified healthcare professionals for medical decisions.
          </p>
        </div>
      </section>

      <section>
        <h2>Individual Experiences</h2>
        <p>
          Individual experiences may vary. The results and experiences described
          in testimonials are personal to those users and are not guaranteed for
          all users of FamilyCare.Help.
        </p>
        <p>
          Your experience with our platform may differ based on your specific
          circumstances, care coordination needs, and how you use the platform.
        </p>
      </section>

      <section>
        <h2>Privacy Protection</h2>
        <p>
          Any names, images, or identifying details in testimonials have been
          changed to protect privacy and comply with applicable privacy and data
          protection standards.
        </p>
        <p>
          We take the privacy of our users seriously and ensure that no
          personally identifiable information is disclosed without explicit
          consent.
        </p>
      </section>

      <section>
        <h2>Authenticity</h2>
        <p>
          All testimonials reflect genuine feedback from real FamilyCare.Help
          users. We do not fabricate or alter the substance of user experiences,
          though we may edit for clarity, brevity, or privacy protection.
        </p>
      </section>

      <section>
        <h2>Questions</h2>
        <p>
          If you have questions about our testimonials or this disclaimer,
          please contact us at{" "}
          <a href="mailto:familycarehelp@mail.com">familycarehelp@mail.com</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
