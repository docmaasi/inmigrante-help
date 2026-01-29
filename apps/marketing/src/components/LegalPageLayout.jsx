import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function LegalPageLayout({ title, icon: Icon, lastUpdated, children }) {
  return (
    <div className="py-8 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header Section */}
        <motion.header variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {Icon && (
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                  boxShadow: "0 4px 14px -2px rgba(79, 70, 229, 0.3)",
                }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
            )}
            <h1
              className="text-3xl md:text-4xl font-bold text-[#1F2937]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Calendar className="w-4 h-4 text-[#E07A5F]" />
              <span style={{ fontFamily: "var(--font-body)" }}>
                Last Updated: {lastUpdated}
              </span>
            </div>
          )}
        </motion.header>

        {/* Content Card */}
        <motion.article
          variants={itemVariants}
          className="card-glass p-8 md:p-12 legal-content"
        >
          {children}
        </motion.article>

        {/* Back to Home Link */}
        <motion.nav variants={itemVariants} className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#4F46E5] transition-colors duration-200 text-sm font-medium group"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </motion.nav>
      </motion.div>

      {/* Scoped Styles for Legal Content */}
      <style>{`
        .legal-content {
          font-family: var(--font-body);
          line-height: 1.75;
          color: #4B5563;
        }

        .legal-content h2 {
          font-family: var(--font-display);
          color: #4F46E5;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(79, 70, 229, 0.15);
        }

        .legal-content h2:first-child {
          margin-top: 0;
        }

        .legal-content h3 {
          font-family: var(--font-display);
          color: #1F2937;
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
          background: linear-gradient(135deg, #E07A5F 0%, #F4A261 100%);
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
          background: linear-gradient(135deg, #E07A5F 0%, #F4A261 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
        }

        .legal-content a {
          color: #E07A5F;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .legal-content a:hover {
          color: #4F46E5;
          text-decoration: underline;
        }

        .legal-content .callout,
        .legal-content [class*="callout"],
        .legal-content .notice,
        .legal-content [class*="notice"],
        .legal-content .info-box {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%);
          border-left: 4px solid #4F46E5;
          padding: 1.25rem 1.5rem;
          border-radius: 0 0.75rem 0.75rem 0;
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
          color: #1F2937;
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
