import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  useCareRecipients,
  useTeamMembers,
} from '@/hooks';
import TaskAssignmentList from '../components/collaboration/TaskAssignmentList';
import CaregiverActivityLog from '../components/collaboration/CaregiverActivityLog';
import SharedCalendarView from '../components/collaboration/SharedCalendarView';
import TeamAnnouncementBanner from '../components/collaboration/TeamAnnouncementBanner';

export default function Collaboration() {
  const { user } = useAuth();
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  const { data: recipients = [] } = useCareRecipients();
  const { data: allTeamMembers = [] } = useTeamMembers();

  // Filter team members by selected recipient
  const teamMembers = selectedRecipientId
    ? allTeamMembers.filter(m => m.care_recipient_id === selectedRecipientId && m.status !== 'removed')
    : [];

  // Transform recipients to match expected format
  const formattedRecipients = recipients.map(r => ({
    ...r,
    full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  // Set first recipient as default
  useEffect(() => {
    if (formattedRecipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(formattedRecipients[0].id);
    }
  }, [formattedRecipients, selectedRecipientId]);

  const selectedRecipient = formattedRecipients.find(r => r.id === selectedRecipientId);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Users className="w-8 h-8 text-teal-600" />
            Team Collaboration
          </h1>
          <p className="text-slate-500">Coordinate care, assign tasks, and track team activity</p>
        </div>

        {/* Care Recipient Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="max-w-xs">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Select Care Recipient
              </label>
              <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {formattedRecipients.map(recipient => (
                    <SelectItem key={recipient.id} value={recipient.id}>
                      {recipient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedRecipient && (
          <>
            {/* Team Announcements */}
            <Card className="mb-6 border border-slate-200">
              <CardContent className="pt-6">
                <TeamAnnouncementBanner careRecipientId={selectedRecipientId} />
              </CardContent>
            </Card>

            {/* Team Members Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Care Team</CardTitle>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-slate-500">No team members assigned yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map(member => (
                      <div key={member.id} className="p-4 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors">
                        <p className="font-medium text-slate-800">{member.full_name}</p>
                        <p className="text-xs text-teal-600 font-medium mt-1">
                          {member.role === 'admin' ? 'Admin' : member.role === 'caregiver' ? 'Caregiver' : 'Viewer'}
                        </p>
                        {member.relationship && (
                          <p className="text-xs text-slate-600 mt-1">{member.relationship}</p>
                        )}
                        {member.specialties && (
                          <p className="text-xs text-slate-600 mt-2">{member.specialties}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tasks & Calendar */}
              <div className="lg:col-span-2 space-y-6">
                <TaskAssignmentList careRecipientId={selectedRecipientId} />
                <SharedCalendarView careRecipientId={selectedRecipientId} />
              </div>

              {/* Activity Log */}
              <div>
                <CaregiverActivityLog careRecipientId={selectedRecipientId} limit={30} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
