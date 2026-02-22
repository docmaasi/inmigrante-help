import { Cookie } from "lucide-react";
import LegalPageLayout from "../components/LegalPageLayout";

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      icon={Cookie}
      lastUpdated="January 14, 2026"
    >
      <section>
        <h2>What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your device when you
          visit our website. They help us provide you with a better experience
          by remembering your preferences and understanding how you use our
          platform.
        </p>
      </section>

      <section>
        <h2>Types of Cookies We Use</h2>
        <p>FamilyCare.Help uses the following types of cookies:</p>

        <h3>Essential Cookies</h3>
        <p>
          Required for the platform to function properly and cannot be disabled.
        </p>

        <h3>Performance Cookies</h3>
        <p>
          Help us understand how visitors interact with our platform by
          collecting anonymous information.
        </p>

        <h3>Preference Cookies</h3>
        <p>
          Remember your preferences and provide enhanced, personalized features.
        </p>

        <h3>Analytics Cookies</h3>
        <p>
          Used to operate and improve the platform's functionality and user
          experience.
        </p>
      </section>

      <section>
        <h2>Managing Cookies</h2>
        <p>
          You may manage cookies via your browser settings. Disabling cookies
          may limit functionality of the platform.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have questions about our use of cookies, please contact us at{" "}
          <a href="mailto:admin@familycare.help">admin@familycare.help</a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
