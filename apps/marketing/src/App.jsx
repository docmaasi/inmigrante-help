import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import LegalDisclosure from "./pages/LegalDisclosure";
import RecordRetentionPolicy from "./pages/RecordRetentionPolicy";
import TestimonialDisclaimer from "./pages/TestimonialDisclaimer";
import MarketingLayout from "./components/MarketingLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/about"
          element={
            <MarketingLayout>
              <About />
            </MarketingLayout>
          }
        />
        <Route
          path="/pricing"
          element={
            <MarketingLayout>
              <Pricing />
            </MarketingLayout>
          }
        />
        <Route
          path="/faq"
          element={
            <MarketingLayout>
              <FAQ />
            </MarketingLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <MarketingLayout>
              <PrivacyPolicy />
            </MarketingLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <MarketingLayout>
              <TermsOfService />
            </MarketingLayout>
          }
        />
        <Route
          path="/cookies"
          element={
            <MarketingLayout>
              <CookiePolicy />
            </MarketingLayout>
          }
        />
        <Route
          path="/legal"
          element={
            <MarketingLayout>
              <LegalDisclosure />
            </MarketingLayout>
          }
        />
        <Route
          path="/retention-policy"
          element={
            <MarketingLayout>
              <RecordRetentionPolicy />
            </MarketingLayout>
          }
        />
        <Route
          path="/testimonial-disclaimer"
          element={
            <MarketingLayout>
              <TestimonialDisclaimer />
            </MarketingLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
