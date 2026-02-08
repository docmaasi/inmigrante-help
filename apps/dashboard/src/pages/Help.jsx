import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  HelpCircle,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Users,
  Calendar,
  Pill,
  CreditCard,
  Shield,
  ExternalLink
} from 'lucide-react';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'https://familycare.help';

const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: HelpCircle,
    questions: [
      {
        q: 'How do I add a care recipient?',
        a: 'From your dashboard, click "Add Care Recipient" button. Fill in their name, date of birth, and any relevant medical conditions or notes. You can add multiple care recipients if you\'re caring for more than one person.'
      },
      {
        q: 'How do I invite family members to join?',
        a: 'Go to the Team page and click "Add Team Member". Enter their email address and select their role (Admin, Caregiver, or Viewer). They\'ll receive an email invitation to join your care team.'
      },
      {
        q: 'What\'s the difference between Admin, Caregiver, and Viewer roles?',
        a: 'Admins have full access and can manage team members, billing, and all care data. Caregivers can add and edit care information but cannot manage team or billing. Viewers can only see care information without making changes.'
      }
    ]
  },
  {
    id: 'tasks-scheduling',
    title: 'Tasks & Scheduling',
    icon: Calendar,
    questions: [
      {
        q: 'How do I create a recurring task?',
        a: 'When creating a task, select a recurrence pattern (Daily, Weekly, or Monthly) from the "Recurring" dropdown. The task will automatically repeat according to your selection.'
      },
      {
        q: 'Can I assign tasks to specific team members?',
        a: 'Yes! When creating or editing a task, use the "Assign To" dropdown to select a team member. They\'ll be notified of the assignment.'
      },
      {
        q: 'How do I schedule caregiver shifts?',
        a: 'Go to the Scheduling page, select a care recipient, and click "Create Shift". Choose the caregiver, date, time, and add any notes. You can also set up recurring shifts.'
      }
    ]
  },
  {
    id: 'medications',
    title: 'Medications',
    icon: Pill,
    questions: [
      {
        q: 'How do I track medication doses?',
        a: 'Go to the Medication Log page. You\'ll see all medications scheduled for today. Check off each medication as it\'s administered. This creates a permanent record.'
      },
      {
        q: 'How do refill reminders work?',
        a: 'When adding a medication, enter the next refill date. The system will show refills due in the Refills section. You can mark them as pending, ordered, or filled.'
      },
      {
        q: 'Can I search for medications?',
        a: 'Yes! When adding a medication, start typing the name and suggestions will appear. This helps ensure accurate medication names and dosages.'
      }
    ]
  },
  {
    id: 'team-communication',
    title: 'Team & Communication',
    icon: Users,
    questions: [
      {
        q: 'Are messages private?',
        a: 'Messages are only visible to members of each conversation. All messages are stored permanently and cannot be edited or deleted to maintain an accurate care record.'
      },
      {
        q: 'How do I share updates with the team?',
        a: 'In any conversation, click the share button to share appointments, medications, or tasks with the team. This creates a formatted update message.'
      },
      {
        q: 'Can I log calls with doctors?',
        a: 'Yes! Use the External Communications tab in Messages to log phone calls, emails, or visits with doctors, pharmacies, or hospitals.'
      }
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Subscription',
    icon: CreditCard,
    questions: [
      {
        q: 'How do I change my payment method?',
        a: 'Go to Settings > Subscription & Billing and click "Manage Subscription". This opens Stripe\'s secure billing portal where you can update your payment method.'
      },
      {
        q: 'How do I add more family members to my plan?',
        a: 'Additional family members can be added at $5/month each through the Stripe billing portal. Go to Settings > Subscription & Billing to manage this.'
      },
      {
        q: 'What happens if I cancel?',
        a: 'After cancellation, you have 90 days of read-only access to your data. After 90 days, your data may be permanently deleted. You can reactivate anytime within that period.'
      }
    ]
  },
  {
    id: 'privacy-security',
    title: 'Privacy & Security',
    icon: Shield,
    questions: [
      {
        q: 'Is FamilyCare.Help HIPAA compliant?',
        a: 'No. FamilyCare.Help is designed for family care coordination and informational purposes only. It should not be used to store protected health information (PHI). Please do not use this platform for medical records.'
      },
      {
        q: 'How is my data protected?',
        a: 'All data is encrypted in transit and at rest. We use Supabase for secure data storage with row-level security policies. Only authorized team members can access your care information.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings and scroll to the "Delete Account" section. This will permanently delete all your data. This action cannot be undone.'
      }
    ]
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = FAQ_CATEGORIES.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-teal-600" />
            Help Center
          </h1>
          <p className="text-slate-500">Find answers to common questions and get support</p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-teal-200 bg-teal-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Mail className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Email Support</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Get help from our support team within 24-48 hours
                  </p>
                  <a
                    href="mailto:familycarehelp@mail.com"
                    className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    familycarehelp@mail.com
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <FileText className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Documentation</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Read our guides and documentation
                  </p>
                  <a
                    href={`${MARKETING_URL}/faq`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    Visit FAQ Page
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search FAQs */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {(searchQuery ? filteredCategories : FAQ_CATEGORIES).map(category => (
            <Card key={category.id} className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <category.icon className="w-5 h-5 text-teal-600" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-slate-100">
                  {category.questions.map((item, index) => {
                    const key = `${category.id}-${index}`;
                    const isExpanded = expandedQuestions[key];

                    return (
                      <div key={index} className="py-3">
                        <button
                          onClick={() => toggleQuestion(category.id, index)}
                          className="w-full flex items-start justify-between text-left gap-4"
                        >
                          <span className="font-medium text-slate-800">
                            {item.q}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-0 pr-8">
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {searchQuery && filteredCategories.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-800 mb-2">No results found</h3>
                <p className="text-sm text-slate-500 mb-4">
                  We couldn't find any FAQs matching "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Still need help */}
        <Card className="mt-8 border-teal-200 bg-gradient-to-r from-teal-50 to-teal-100/50">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-10 h-10 text-teal-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 text-lg mb-2">
              Still need help?
            </h3>
            <p className="text-slate-600 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button
              asChild
              className="bg-teal-600 hover:bg-teal-700"
            >
              <a href="mailto:familycarehelp@mail.com">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
