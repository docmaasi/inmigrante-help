import { Link } from "react-router-dom";
import { Heart, ArrowRight, Mail } from "lucide-react";

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "https://app.familycare.help";

export default function MarketingLayout({ children }) {
  const footerNavItems = [
    { name: "FAQ", path: "/faq" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" },
    { name: "Legal Disclosure", path: "/legal" },
    { name: "Record Retention", path: "/retention-policy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg"
                alt="FamilyCare.Help Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  FamilyCare<span className="text-orange-500">.Help</span>
                </h1>
                <p className="text-xs text-slate-500">Coordinating care together</p>
              </div>
            </Link>
            <a
              href={DASHBOARD_URL}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Enter App <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" fill="currentColor" />
              <span className="text-slate-600 font-medium">www.FamilyCare.Help</span>
            </div>
            <p className="text-sm text-slate-500">
              Giving caregivers clarity, accountability, and peace of mind
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-600 flex-wrap">
              {footerNavItems.map((item, index) => (
                <span key={item.path}>
                  {index > 0 && <span className="text-slate-300 mr-4">|</span>}
                  <Link to={item.path} className="hover:text-blue-600 transition-colors">
                    {item.name}
                  </Link>
                </span>
              ))}
              <span className="text-slate-300">|</span>
              <a
                href="mailto:familycarehelp@mail.com"
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
