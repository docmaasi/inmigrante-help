import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@familycare/ui';
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Users,
  Shield,
  FileText,
  CreditCard,
  HeartHandshake,
  Stethoscope,
  Headphones
} from 'lucide-react';

const sectionIcons = {
  'Getting Started': HelpCircle,
  'Accounts & Access': Users,
  'Care Coordination Features': HeartHandshake,
  'Privacy & Security': Shield,
  'Medical & Legal Disclaimer': Stethoscope,
  'Records & Documentation': FileText,
  'Subscription & Billing': CreditCard,
  'Support & Help': Headphones,
};

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
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function FAQ() {
  const faqSections = [
    {
      title: "Getting Started",
      questions: [
        {
          q: "What is FamilyCare.Help?",
          a: "FamilyCare.Help is a care coordination platform designed to help families organize care for seniors and individuals with disabilities in one secure place."
        },
        {
          q: "Who is FamilyCare.Help for?",
          a: "FamilyCare.Help is for family caregivers, relatives, and trusted care partners coordinating appointments, medications, activities, and daily care responsibilities."
        },
        {
          q: "Do all family members need an account?",
          a: "No. One person can manage care independently. You may invite family members or caregivers if shared access is helpful."
        },
        {
          q: "Can I manage care for more than one loved one?",
          a: "Yes. You can create and manage multiple Loved One Profiles within a single account for $5 per month each. Currently, only one additional profile is available. We are working on adding multiple profiles. Email admin@familycare.help for updates or questions."
        }
      ]
    },
    {
      title: "Accounts & Access",
      questions: [
        {
          q: "How do I invite family members or caregivers?",
          a: "After creating your account, go to Settings > Invite Care Partner and enter their email address. They will receive an invitation to join."
        },
        {
          q: "Can access levels be controlled?",
          a: "Yes. You can assign different access levels depending on each care partner's role."
        },
        {
          q: "Can I use FamilyCare.Help if family members don't participate?",
          a: "Yes. The platform remains fully functional for personal use even if others choose not to join."
        }
      ]
    },
    {
      title: "Care Coordination Features",
      questions: [
        {
          q: "What information can I track in FamilyCare.Help?",
          a: "You can track appointments, medications, care notes, activities, documents, and important updates related to care."
        },
        {
          q: "Can I upload medical or care-related documents?",
          a: "Yes. You can upload and securely store relevant documents for reference and coordination."
        },
        {
          q: "Are activities and notes time-stamped?",
          a: "Yes. Entries are automatically date- and time-stamped for accuracy."
        }
      ]
    },
    {
      title: "Privacy & Security",
      questions: [
        {
          q: "Is my family's information private?",
          a: "Yes. FamilyCare.Help uses secure systems to protect your data and personal information."
        },
        {
          q: "Who can see my notes and records?",
          a: "Only individuals you invite and authorize can view shared records. Private notes remain visible only to you."
        },
        {
          q: "Does FamilyCare.Help share or sell data?",
          a: "No. FamilyCare.Help does not sell or share personal data with third parties except as required by law."
        }
      ]
    },
    {
      title: "Medical & Legal Disclaimer",
      questions: [
        {
          q: "Is FamilyCare.Help a medical service?",
          a: "No. FamilyCare.Help is a care coordination and documentation tool and does not provide medical advice or healthcare services."
        },
        {
          q: "Can FamilyCare.Help replace a doctor or professional caregiver?",
          a: "No. The platform supports coordination and communication but does not replace licensed medical or caregiving professionals."
        }
      ]
    },
    {
      title: "Records & Documentation",
      questions: [
        {
          q: "Can records be exported?",
          a: "Yes. You can download care records and documentation for your personal use."
        },
        {
          q: "Can records be edited or deleted?",
          a: "Some entries may be editable based on feature settings. Historical records are preserved to maintain accuracy."
        },
        {
          q: "Are records permanent?",
          a: "Records are retained according to your subscription status and the platform's retention policy."
        }
      ]
    },
    {
      title: "Subscription & Billing",
      questions: [
        {
          q: "Is there a free trial?",
          a: "Yes. FamilyCare.Help offers a limited trial so you can explore features before subscribing."
        },
        {
          q: "Can I cancel at any time?",
          a: "Yes. Subscriptions can be canceled at any time through account settings."
        },
        {
          q: "What happens to my data if I cancel?",
          a: "After cancellation, records are retained for up to 90 days. If you renew within that period, your data remains intact. After 90 days, records may be permanently deleted."
        }
      ]
    },
    {
      title: "Support & Help",
      questions: [
        {
          q: "How do I get help if I have questions?",
          a: "Support is available through the app or by contacting our support team."
        },
        {
          q: "Is FamilyCare.Help available on mobile devices?",
          a: "Yes. FamilyCare.Help is designed to work across modern devices and browsers."
        }
      ]
    }
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'var(--gradient-hero)',
        fontFamily: 'var(--font-body)'
      }}
    >
      {/* Hero Area */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pt-16 pb-12 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-charcoal-900)'
            }}
          >
            <span className="hand-drawn-underline">Frequently Asked</span>
            <br />
            <span style={{ color: 'var(--color-indigo-600)' }}>Questions</span>
          </h1>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--color-charcoal-600)' }}
          >
            Everything you need to know about coordinating care with FamilyCare.Help.
            Can't find what you're looking for? Reach out to our support team.
          </p>
        </div>
      </motion.section>

      {/* Contact Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 mb-12"
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="glass-card rounded-2xl p-6 sm:p-8"
            style={{
              borderLeft: '4px solid var(--color-coral-500)',
              boxShadow: 'var(--shadow-warm)'
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-coral-100)' }}
              >
                <MessageCircle
                  className="w-6 h-6"
                  style={{ color: 'var(--color-coral-500)' }}
                />
              </div>
              <div className="flex-grow">
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: 'var(--color-charcoal-900)'
                  }}
                >
                  Need personalized help?
                </h3>
                <p style={{ color: 'var(--color-charcoal-600)' }}>
                  Our support team is here to assist you with any questions about your care coordination journey.
                </p>
              </div>
              <a
                href="mailto:admin@familycare.help"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: 'var(--gradient-warm)',
                  color: 'white',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Sections */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 pb-16"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {faqSections.map((section, sectionIndex) => {
            const IconComponent = sectionIcons[section.title] || HelpCircle;

            return (
              <motion.div key={sectionIndex} variants={itemVariants}>
                <Card
                  className="overflow-hidden border-0"
                  style={{
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-xl)'
                  }}
                >
                  <CardHeader
                    className="pb-4"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-cream-50) 0%, var(--color-indigo-50) 100%)',
                      borderBottom: '1px solid var(--color-cream-300)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-indigo-100)' }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: 'var(--color-indigo-600)' }}
                        />
                      </div>
                      <CardTitle
                        className="text-xl sm:text-2xl"
                        style={{
                          fontFamily: 'var(--font-display)',
                          color: 'var(--color-indigo-900)'
                        }}
                      >
                        {section.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {section.questions.map((item, questionIndex) => (
                        <AccordionItem
                          key={questionIndex}
                          value={`item-${sectionIndex}-${questionIndex}`}
                          className="border-b last:border-b-0"
                          style={{ borderColor: 'var(--color-cream-300)' }}
                        >
                          <AccordionTrigger
                            className="px-6 py-5 text-left font-medium hover:no-underline group"
                            style={{ color: 'var(--color-charcoal-800)' }}
                          >
                            <span className="group-hover:text-[var(--color-indigo-600)] transition-colors duration-200">
                              {item.q}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent
                            className="px-6 pb-5 leading-relaxed"
                            style={{ color: 'var(--color-charcoal-600)' }}
                          >
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Bottom CTA */}
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
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--color-indigo-100)' }}
            >
              <HeartHandshake
                className="w-8 h-8"
                style={{ color: 'var(--color-indigo-600)' }}
              />
            </div>
            <h2
              className="text-2xl sm:text-3xl font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-charcoal-900)'
              }}
            >
              Still have questions?
            </h2>
            <p
              className="mb-8 max-w-md mx-auto"
              style={{ color: 'var(--color-charcoal-600)' }}
            >
              We're here to help you every step of the way. Our team is ready to support your care coordination needs.
            </p>
            <a
              href="mailto:admin@familycare.help"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                background: 'var(--gradient-accent)',
                color: 'white',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
