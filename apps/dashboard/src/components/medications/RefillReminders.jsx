import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { parseISO, differenceInDays, startOfToday, format } from 'date-fns';

export default function RefillReminders() {
  const [isSending, setIsSending] = useState(false);

  const { data: refills = [] } = useQuery({
    queryKey: ['medicationRefills'],
    queryFn: () => base44.entities.MedicationRefill.list('refill_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      const today = startOfToday();
      const upcomingRefills = refills.filter(r => {
        if (r.status === 'completed') return false;
        const refillDate = parseISO(r.refill_date);
        const daysUntil = differenceInDays(refillDate, today);
        return daysUntil <= 7; // Upcoming in next 7 days or overdue
      });

      if (upcomingRefills.length === 0) {
        throw new Error('No upcoming refills to remind about');
      }

      // Group refills by assigned user or send to all admins
      const remindersByUser = {};
      
      upcomingRefills.forEach(refill => {
        const recipient = recipients.find(r => r.id === refill.care_recipient_id);
        const recipientName = recipient?.full_name || 'Unknown';
        
        if (refill.assigned_to) {
          if (!remindersByUser[refill.assigned_to]) {
            remindersByUser[refill.assigned_to] = [];
          }
          remindersByUser[refill.assigned_to].push({ ...refill, recipientName });
        } else {
          // Send to all admins if not assigned
          const admins = teamMembers.filter(tm => tm.role === 'admin');
          admins.forEach(admin => {
            if (!remindersByUser[admin.user_email]) {
              remindersByUser[admin.user_email] = [];
            }
            remindersByUser[admin.user_email].push({ ...refill, recipientName });
          });
        }
      });

      // Send emails to each user
      const emailPromises = Object.entries(remindersByUser).map(([email, userRefills]) => {
        const refillList = userRefills.map(r => {
          const daysUntil = differenceInDays(parseISO(r.refill_date), today);
          const urgency = daysUntil < 0 ? `OVERDUE by ${Math.abs(daysUntil)} days` : `Due in ${daysUntil} days`;
          return `• ${r.medication_name} for ${r.recipientName} - ${urgency} (${format(parseISO(r.refill_date), 'MMM d, yyyy')})`;
        }).join('\n');

        const subject = `Medication Refill Reminder - ${userRefills.length} refill${userRefills.length > 1 ? 's' : ''} need attention`;
        const body = `Hello,

This is an automated reminder about upcoming medication refills:

${refillList}

Please ensure these medications are refilled on time. You can manage refills in the FamilyCare.Help app.

Thank you,
FamilyCare.Help Team`;

        return base44.integrations.Core.SendEmail({
          to: email,
          subject: subject,
          body: body,
          from_name: 'FamilyCare Reminders'
        });
      });

      await Promise.all(emailPromises);
      return Object.keys(remindersByUser).length;
    },
    onSuccess: (count) => {
      toast.success(`Reminders sent to ${count} team member${count > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reminders');
    }
  });

  const handleSendReminders = async () => {
    setIsSending(true);
    try {
      await sendRemindersMutation.mutateAsync();
    } finally {
      setIsSending(false);
    }
  };

  const today = startOfToday();
  const upcomingCount = refills.filter(r => {
    if (r.status === 'completed') return false;
    const refillDate = parseISO(r.refill_date);
    const daysUntil = differenceInDays(refillDate, today);
    return daysUntil <= 7;
  }).length;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="border-b border-blue-200">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="w-5 h-5" />
          Automated Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-700 mb-2">
                Send email reminders to team members about upcoming refills (within 7 days or overdue).
              </p>
              {upcomingCount > 0 && (
                <Badge className="bg-blue-600 text-white">
                  {upcomingCount} refill{upcomingCount > 1 ? 's' : ''} need attention
                </Badge>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-blue-200">
            <p className="font-semibold mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Reminders sent to assigned team members or all admins</li>
              <li>Includes refill urgency and recipient information</li>
              <li>Only sends for pending and ordered refills</li>
            </ul>
          </div>

          <Button
            onClick={handleSendReminders}
            disabled={isSending || upcomingCount === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending Reminders...' : `Send Reminders Now (${upcomingCount})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}