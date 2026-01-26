import React, { useState } from 'react';
import { useMedications, useCareRecipients, useTeamMembers } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { parseISO, differenceInDays, startOfToday, format } from 'date-fns';

export function RefillReminders() {
  const [isSending, setIsSending] = useState(false);

  const { data: medications = [] } = useMedications();
  const { data: recipients = [] } = useCareRecipients();
  const { data: teamMembers = [] } = useTeamMembers();

  const refillsNeedingAttention = medications.filter(med => {
    if (!med.is_active || !med.refill_date) return false;
    const refillDate = parseISO(med.refill_date);
    const today = startOfToday();
    const daysUntil = differenceInDays(refillDate, today);
    return daysUntil <= 7;
  });

  const handleSendReminders = async () => {
    if (refillsNeedingAttention.length === 0) {
      toast.error('No upcoming refills to remind about');
      return;
    }

    setIsSending(true);
    try {
      const today = startOfToday();
      const remindersByUser = {};

      refillsNeedingAttention.forEach(med => {
        const recipient = recipients.find(r => r.id === med.care_recipient_id);
        const recipientName = recipient?.full_name || 'Unknown';

        const admins = teamMembers.filter(tm => tm.role === 'admin');
        admins.forEach(admin => {
          if (!remindersByUser[admin.email]) {
            remindersByUser[admin.email] = [];
          }
          remindersByUser[admin.email].push({ ...med, recipientName });
        });
      });

      const emailPromises = Object.entries(remindersByUser).map(async ([email, userRefills]) => {
        const refillList = userRefills.map(r => {
          const daysUntil = differenceInDays(parseISO(r.refill_date), today);
          const urgency = daysUntil < 0 ? `OVERDUE by ${Math.abs(daysUntil)} days` : `Due in ${daysUntil} days`;
          return `- ${r.name} for ${r.recipientName} - ${urgency} (${format(parseISO(r.refill_date), 'MMM d, yyyy')})`;
        }).join('\n');

        const subject = `Medication Refill Reminder - ${userRefills.length} refill${userRefills.length > 1 ? 's' : ''} need attention`;
        const body = `Hello,

This is an automated reminder about upcoming medication refills:

${refillList}

Please ensure these medications are refilled on time. You can manage refills in the FamilyCare.Help app.

Thank you,
FamilyCare.Help Team`;

        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: email,
            subject: subject,
            text: body,
            from_name: 'FamilyCare Reminders'
          }
        });

        if (error) throw error;
      });

      await Promise.all(emailPromises);
      const count = Object.keys(remindersByUser).length;
      toast.success(`Reminders sent to ${count} team member${count > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error(error.message || 'Failed to send reminders');
    } finally {
      setIsSending(false);
    }
  };

  const upcomingCount = refillsNeedingAttention.length;

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
              <li>Only sends for active medications with refill dates</li>
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

export default RefillReminders;
