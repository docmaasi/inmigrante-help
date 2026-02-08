import { Link } from "react-router-dom";
import { Heart, ArrowRight, Mail, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../lib/use-auth";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3001";

export function MarketingLayout({ children, fullWidth = false }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 10);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const footerNavItems = [
    { name: "About Us", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    { name: "FAQ", path: "/faq" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "Legal Disclosure", path: "/legal" },
    { name: "Record Retention", path: "/retention-policy" },
    { name: "Testimonial Disclaimer", path: "/testimonial-disclaimer" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FAF7F2" }}
    >
      {/* Header - Glassmorphism with scroll-aware border */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          hasScrolled ? "shadow-sm" : ""
        }`}
        style={{
          backgroundColor: "rgba(250, 247, 242, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: hasScrolled
            ? "1px solid rgba(79, 70, 229, 0.1)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg"
                alt="FamilyCare.Help Logo"
                className="w-11 h-11 object-contain rounded-lg shadow-sm"
              />
              <div>
                <h1
                  className="text-xl font-bold tracking-tight"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  <span style={{ color: "#4F46E5" }}>FamilyCare</span>
                  <span style={{ color: "#E07A5F" }}>.Help</span>
                </h1>
                <p
                  className="text-xs tracking-wide"
                  style={{
                    color: "#6B7280",
                    fontFamily: "var(--font-body), sans-serif",
                  }}
                >
                  Coordinating care together
                </p>
              </div>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="w-24 h-10" />
              ) : isAuthenticated ? (
                <a
                  href={`${DASHBOARD_URL}/`}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{
                    backgroundColor: "#4F46E5",
                    fontFamily: "var(--font-body), sans-serif",
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </a>
              ) : (
                <>
                  <a
                    href={`${DASHBOARD_URL}/login`}
                    className="px-5 py-2.5 rounded-full font-medium transition-all duration-200 hover:bg-indigo-50"
                    style={{
                      color: "#4F46E5",
                      fontFamily: "var(--font-body), sans-serif",
                    }}
                  >
                    Sign In
                  </a>
                  <a
                    href={`${DASHBOARD_URL}/signup`}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                    style={{
                      backgroundColor: "#4F46E5",
                      fontFamily: "var(--font-body), sans-serif",
                    }}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={fullWidth ? "flex-1" : "flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8"}>
        {children}
      </main>

      {/* Footer - Dark slate with warm accents */}
      <footer style={{ backgroundColor: "#1F2937" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart
                  className="w-5 h-5"
                  style={{ color: "#E07A5F" }}
                  fill="currentColor"
                />
                <span
                  className="font-bold text-lg"
                  style={{
                    color: "#FAF7F2",
                    fontFamily: "var(--font-display), serif",
                  }}
                >
                  <span style={{ color: "#FAF7F2" }}>FamilyCare</span>
                  <span style={{ color: "#E07A5F" }}>.Help</span>
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#D1D5DB",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                Giving caregivers clarity, accountability, and peace of mind.
              </p>
              <p
                className="text-xs"
                style={{
                  color: "#9CA3AF",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                Trusted by families caring for loved ones.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: "#9CA3AF",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                Legal
              </h3>
              <nav className="grid grid-cols-2 gap-2">
                {footerNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-sm transition-colors duration-200 hover:translate-x-0.5"
                    style={{
                      color: "#D1D5DB",
                      fontFamily: "var(--font-body), sans-serif",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#E07A5F")}
                    onMouseLeave={(e) => (e.target.style.color = "#D1D5DB")}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: "#9CA3AF",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                Get in Touch
              </h3>
              <a
                href="mailto:familycarehelp@mail.com"
                className="inline-flex items-center gap-2 text-sm transition-all duration-200 group"
                style={{
                  color: "#D1D5DB",
                  fontFamily: "var(--font-body), sans-serif",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#E07A5F")}
                onMouseLeave={(e) => (e.target.style.color = "#D1D5DB")}
              >
                <Mail
                  className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                  style={{ color: "#E07A5F" }}
                />
                familycarehelp@mail.com
              </a>
              <p
                className="text-xs"
                style={{
                  color: "#6B7280",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                We typically respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            className="mt-10 pt-8"
            style={{ borderTop: "1px solid rgba(250, 247, 242, 0.1)" }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p
                className="text-xs flex items-center gap-1"
                style={{
                  color: "#6B7280",
                  fontFamily: "var(--font-body), sans-serif",
                }}
              >
                &copy; {new Date().getFullYear()} FamilyCare.Help. Made with
                <Heart
                  className="w-3 h-3 mx-1"
                  style={{ color: "#E07A5F" }}
                  fill="currentColor"
                />
                for families everywhere.
              </p>
              <a
                href={`${DASHBOARD_URL}/login`}
                className="text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                style={{
                  color: "#9CA3AF",
                  fontFamily: "var(--font-body), sans-serif",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#FAF7F2")}
                onMouseLeave={(e) => (e.target.style.color = "#9CA3AF")}
              >
                Sign In
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingLayout;
