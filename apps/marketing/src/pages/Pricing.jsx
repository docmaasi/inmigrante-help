import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Check,
  Heart,
  Shield,
  Users,
  HelpCircle,
  Mail,
  Sparkles
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const includedFeatures = [
  'Unlimited tasks and appointments',
  'Care notes and daily logs',
  'Document storage',
  'Team messaging',
  'Medication tracking',
  'Smart reminders',
];

const faqs = [
  {
    q: 'Is there a free trial?',
    a: 'Yes! You can explore FamilyCare.Help with a free trial before subscribing.',
  },
  {
    q: 'Can I add more loved ones later?',
    a: 'Absolutely. You can add additional Loved One Profiles at any time for $5/month each.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards through our secure Stripe payment system.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription at any time through your account settings. Your data is retained for 60 days after cancellation.',
  },
];

export default function Pricing() {
  useEffect(() => {
    // Load Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--gradient-hero)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pt-16 pb-12 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--color-indigo-100)' }}
          >
            <Sparkles
              className="w-8 h-8"
              style={{ color: 'var(--color-indigo-600)' }}
            />
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-charcoal-900)'
            }}
          >
            Simple, <span className="hand-drawn-underline">Transparent</span>{' '}
            <span style={{ color: 'var(--color-indigo-600)' }}>Pricing</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-4"
            style={{ color: 'var(--color-charcoal-600)' }}
          >
            Start coordinating care for your family today. No hidden fees, no surprises.
          </p>

          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: 'var(--color-charcoal-500)' }}
          >
            Base plan includes 1 Loved One Profile. Add more profiles anytime.
          </p>
        </div>
      </motion.section>

      {/* Stripe Pricing Table */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-12"
      >
        <div className="max-w-5xl mx-auto">
          <div
            className="glass-card rounded-3xl p-6 sm:p-10"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Stripe Pricing Table Embed */}
            <stripe-pricing-table
              pricing-table-id="prctbl_1Sq0SNDw3DaD2xXnnwMDC51e"
              publishable-key="pk_live_51SdEBaDw3DaD2xXn8j40oxVS5GTtf2y1CT0cN9TUc29BS2suu6jjAPjCAfNwj75XKVYV7oMvgGhSCCFx4C7Zgk6v00P0JBlsS3"
            />
          </div>
        </div>
      </motion.section>

      {/* What's Included Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <h2
              className="text-2xl sm:text-3xl font-semibold mb-2"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-charcoal-900)'
              }}
            >
              Everything You Need to Coordinate Care
            </h2>
            <p style={{ color: 'var(--color-charcoal-600)' }}>
              All plans include these core features
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {includedFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white rounded-xl p-4"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-sage-100)' }}
                >
                  <Check
                    className="w-4 h-4"
                    style={{ color: 'var(--color-sage-600)' }}
                  />
                </div>
                <span style={{ color: 'var(--color-charcoal-700)' }}>
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Trust Badges */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'var(--color-indigo-50)' }}
            >
              <Shield className="w-5 h-5" style={{ color: 'var(--color-indigo-600)' }} />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-indigo-700)' }}
              >
                Secure Payments
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'var(--color-coral-50)' }}
            >
              <Heart className="w-5 h-5" style={{ color: 'var(--color-coral-500)' }} />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-coral-700)' }}
              >
                Cancel Anytime
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'var(--color-sage-50)' }}
            >
              <Users className="w-5 h-5" style={{ color: 'var(--color-sage-600)' }} />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-sage-700)' }}
              >
                500+ Families Trust Us
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 pb-12"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-coral-100)' }}
            >
              <HelpCircle
                className="w-6 h-6"
                style={{ color: 'var(--color-coral-500)' }}
              />
            </div>
            <h2
              className="text-2xl sm:text-3xl font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-charcoal-900)'
              }}
            >
              Pricing Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl p-6"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-charcoal-900)'
                  }}
                >
                  {faq.q}
                </h3>
                <p style={{ color: 'var(--color-charcoal-600)' }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="text-center mt-8">
            <Link
              to="/faq"
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--color-indigo-600)' }}
            >
              View all FAQs →
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-20"
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="text-center py-10 px-6 sm:px-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-cream-50) 0%, white 50%, var(--color-indigo-50) 100%)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-charcoal-900)'
              }}
            >
              Have questions about pricing?
            </h2>
            <p
              className="mb-6"
              style={{ color: 'var(--color-charcoal-600)' }}
            >
              Our team is here to help you find the right plan for your family.
            </p>
            <a
              href="mailto:familycarehelp@mail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--gradient-warm)',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
