import { Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";

export default function LegalPageLayout({ title, icon: Icon, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-[#FFFBF7] py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {Icon && (
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100">
                <Icon className="w-7 h-7 text-indigo-600" />
              </div>
            )}
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-display, 'Fraunces'), serif" }}
            >
              {title}
            </h1>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          )}
        </header>

        {/* Content Card */}
        <article className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 md:p-12">
          <div className="legal-content prose prose-slate max-w-none text-slate-700">
            {children}
          </div>
        </article>

        {/* Back to Home Link */}
        <nav className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </nav>
      </div>

      {/* Scoped Styles for Legal Content */}
      <style>{`
        .legal-content {
          font-family: 'DM Sans', system-ui, sans-serif;
          line-height: 1.75;
        }

        .legal-content h2 {
          font-family: var(--font-display, 'Fraunces'), serif;
          color: #4F46E5;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #E5E7EB;
        }

        .legal-content h2:first-child {
          margin-top: 0;
        }

        .legal-content h3 {
          font-family: var(--font-display, 'Fraunces'), serif;
          color: #1E293B;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
        }

        .legal-content p {
          margin-bottom: 1rem;
        }

        .legal-content ul,
        .legal-content ol {
          margin-top: 0.75rem;
          margin-bottom: 1rem;
          padding-left: 0;
          list-style: none;
        }

        .legal-content ul li,
        .legal-content ol li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .legal-content ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.625rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #F97316;
        }

        .legal-content ol {
          counter-reset: list-counter;
        }

        .legal-content ol li {
          counter-increment: list-counter;
        }

        .legal-content ol li::before {
          content: counter(list-counter) '.';
          position: absolute;
          left: 0;
          color: #F97316;
          font-weight: 600;
        }

        .legal-content a {
          color: #F97316;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .legal-content a:hover {
          color: #EA580C;
          text-decoration: underline;
        }

        .legal-content .callout,
        .legal-content [class*="callout"],
        .legal-content .notice,
        .legal-content [class*="notice"],
        .legal-content .info-box {
          background-color: #EEF2FF;
          border-left: 4px solid #4F46E5;
          padding: 1rem 1.25rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 1.5rem 0;
        }

        .legal-content .callout p:last-child,
        .legal-content [class*="callout"] p:last-child,
        .legal-content .notice p:last-child,
        .legal-content [class*="notice"] p:last-child,
        .legal-content .info-box p:last-child {
          margin-bottom: 0;
        }

        .legal-content strong {
          color: #1E293B;
          font-weight: 600;
        }

        .legal-content section {
          margin-bottom: 0.5rem;
        }

        .legal-content section:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
