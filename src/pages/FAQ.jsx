import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Mail } from 'lucide-react';

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
          a: "Yes. You can create and manage multiple Loved One Profiles within a single account for $5 per month each. Currently, only one additional profile is available. We are working on adding multiple profiles. Email familycarehelp@mail.com for updates or questions."
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
          a: "Yes. New users receive a 10-day free trial with full access to all features. After the trial ends, a paid subscription is required to continue using FamilyCare.Help. If no subscription is started within 10 days after the trial expires, all account data will be permanently deleted."
        },
        {
          q: "Can I cancel at any time?",
          a: "Yes. Subscriptions can be canceled at any time through account settings."
        },
        {
          q: "What happens to my data if I cancel?",
          a: "After cancellation, records are retained for up to 10 days. If you renew within that period, your data remains intact. After 10 days, records will be permanently deleted and cannot be recovered."
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Find answers to common questions about FamilyCare.Help
          </p>
        </div>

        {/* Contact Banner */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Need More Help?</h3>
                <p className="text-sm text-blue-800">
                  Contact us at <a href="mailto:familycarehelp@mail.com" className="underline font-medium">familycarehelp@mail.com</a> for additional support or questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {faqSections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
                <CardTitle className="text-xl text-blue-900">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((item, questionIndex) => (
                    <AccordionItem 
                      key={questionIndex} 
                      value={`item-${sectionIndex}-${questionIndex}`}
                    >
                      <AccordionTrigger className="text-left font-semibold text-slate-800 hover:text-blue-600">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Contact */}
        <div className="mt-8 text-center p-6 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-600 mb-3">
            Still have questions?
          </p>
          <a 
            href="mailto:familycarehelp@mail.com"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}