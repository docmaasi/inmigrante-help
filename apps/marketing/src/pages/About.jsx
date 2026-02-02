import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Shield,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

const features = [
  {
    icon: FileText,
    title: 'Shared Care Notes',
    description: 'Keep everyone informed with organized daily logs and observations.'
  },
  {
    icon: Clock,
    title: 'Reminders & Schedules',
    description: 'Never miss an appointment, medication, or important task.'
  },
  {
    icon: Shield,
    title: 'Important Records',
    description: 'Store and access vital documents securely in one place.'
  },
  {
    icon: MessageCircle,
    title: 'Communication Tools',
    description: 'Keep your care team aligned with clear, organized messaging.'
  }
];

const values = [
  'Real families coordinating real care',
  'Sharing responsibilities with siblings',
  'Supporting a loved one from a distance',
  'Managing care as a solo caregiver'
];

export default function About() {
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
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: 'var(--color-coral-100)' }}
          >
            <Heart
              className="w-10 h-10"
              style={{ color: 'var(--color-coral-500)' }}
              fill="currentColor"
            />
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-charcoal-900)'
            }}
          >
            <span className="hand-drawn-underline">About</span>{' '}
            <span style={{ color: 'var(--color-indigo-600)' }}>Us</span>
          </h1>

          <p
            className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed font-medium"
            style={{
              color: 'var(--color-charcoal-700)',
              fontFamily: 'var(--font-display)'
            }}
          >
            Caring for a loved one should feel{' '}
            <span style={{ color: 'var(--color-indigo-600)' }}>supported</span>,
            not overwhelming.
          </p>
        </div>
      </motion.section>

      {/* Main Story Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="glass-card rounded-3xl p-8 sm:p-12"
            style={{
              boxShadow: 'var(--shadow-xl)',
              borderLeft: '4px solid var(--color-indigo-500)'
            }}
          >
            <div className="prose prose-lg max-w-none">
              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: 'var(--color-charcoal-700)' }}
              >
                FamilyCare.Help was created with one simple belief:{' '}
                <strong style={{ color: 'var(--color-indigo-600)' }}>
                  caring for a loved one should feel supported, not overwhelming.
                </strong>
              </p>

              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: 'var(--color-charcoal-600)' }}
              >
                Families today juggle medical appointments, medications, schedules, documents,
                and communication—often across multiple caregivers, locations, and generations.
                FamilyCare.Help brings everything together in one secure, easy-to-use place so
                families can focus less on managing chaos and more on caring with confidence.
              </p>

              <p
                className="text-lg leading-relaxed"
                style={{ color: 'var(--color-charcoal-600)' }}
              >
                Our platform helps families organize care for seniors, individuals with disabilities,
                and loved ones who need ongoing support.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-semibold text-center mb-8"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-charcoal-900)'
            }}
          >
            What We Offer
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{ boxShadow: 'var(--shadow-md)' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-indigo-100)' }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: 'var(--color-indigo-600)' }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-lg mb-1"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: 'var(--color-charcoal-900)'
                        }}
                      >
                        {feature.title}
                      </h3>
                      <p style={{ color: 'var(--color-charcoal-600)' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Built For Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-8 sm:p-12"
            style={{
              background: 'linear-gradient(135deg, var(--color-indigo-50) 0%, var(--color-cream-50) 100%)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-coral-100)' }}
              >
                <Users
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
                Built for Real Families
              </h2>
            </div>

            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: 'var(--color-charcoal-600)' }}
            >
              We built FamilyCare.Help for real families, real caregivers, and real life.
              Whether you're:
            </p>

            <ul className="space-y-3 mb-6">
              {values.map((value, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: 'var(--color-sage-500)' }}
                  />
                  <span style={{ color: 'var(--color-charcoal-700)' }}>{value}</span>
                </li>
              ))}
            </ul>

            <p
              className="text-lg leading-relaxed font-medium"
              style={{ color: 'var(--color-indigo-700)' }}
            >
              Our goal is to make care coordination clearer, calmer, and more compassionate.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Disclaimer Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-12"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="glass-card rounded-2xl p-6 sm:p-8"
            style={{
              borderLeft: '4px solid var(--color-coral-500)',
              boxShadow: 'var(--shadow-warm)'
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-coral-100)' }}
              >
                <Shield
                  className="w-5 h-5"
                  style={{ color: 'var(--color-coral-500)' }}
                />
              </div>
              <div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-charcoal-900)'
                  }}
                >
                  Important Note
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: 'var(--color-charcoal-600)' }}
                >
                  FamilyCare.Help is <strong>not a medical provider</strong>. We are a care
                  organization and documentation platform designed to support families, improve
                  communication, and reduce stress—so no one feels like they're carrying the
                  responsibility alone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Closing Statement */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 pb-20"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center py-12 px-6 sm:px-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-cream-50) 0%, white 50%, var(--color-indigo-50) 100%)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--color-indigo-100)' }}
            >
              <Sparkles
                className="w-8 h-8"
                style={{ color: 'var(--color-indigo-600)' }}
              />
            </motion.div>

            <h2
              className="text-2xl sm:text-3xl font-semibold mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-charcoal-900)'
              }}
            >
              Because when families are supported,
            </h2>
            <p
              className="text-2xl sm:text-3xl font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-indigo-600)'
              }}
            >
              care gets better.
            </p>

            <div className="mt-8">
              <a
                href="https://familycare-dashboard.vercel.app/signup"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: 'var(--gradient-accent)',
                  color: 'white',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Heart className="w-5 h-5" />
                Start Coordinating Care
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
