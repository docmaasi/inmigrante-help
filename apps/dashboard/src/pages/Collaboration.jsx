import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

  const { data: recipients = [] } = useCareRecipients();
  const { data: allTeamMembers = [] } = useTeamMembers();

  // Filter team members by selected recipients
  const teamMembers = selectedRecipientIds.length > 0
    ? allTeamMembers.filter(m => {
        if (m.status === 'removed') return false;
        // Check if any of the member's care_recipient_ids overlap with selected
        const memberIds = Array.isArray(m.care_recipient_ids) ? m.care_recipient_ids : [];
        return memberIds.some(id => selectedRecipientIds.includes(id)) ||
          selectedRecipientIds.includes(m.care_recipient_id);
      })
    : [];

  // Transform recipients to match expected format
  const formattedRecipients = recipients.map(r => ({
    ...r,
    full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  // Select all recipients by default
  useEffect(() => {
    if (formattedRecipients.length > 0 && selectedRecipientIds.length === 0) {
      setSelectedRecipientIds(formattedRecipients.map(r => r.id));
    }
  }, [formattedRecipients, selectedRecipientIds]);

  const handleToggleRecipient = (recipientId, checked) => {
    setSelectedRecipientIds(prev =>
      checked
        ? [...prev, recipientId]
        : prev.filter(id => id !== recipientId)
    );
  };

  const hasSelection = selectedRecipientIds.length > 0;

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
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Select Care Recipient(s)
            </label>
            <div className="flex flex-wrap gap-3">
              {formattedRecipients.map(recipient => (
                <label key={recipient.id} className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 transition-colors">
                  <Checkbox
                    checked={selectedRecipientIds.includes(recipient.id)}
                    onCheckedChange={(checked) => handleToggleRecipient(recipient.id, checked)}
                  />
                  <span className="text-sm text-slate-700">
                    {recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'}
                  </span>
                </label>
              ))}
            </div>
            {selectedRecipientIds.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">{selectedRecipientIds.length} of {formattedRecipients.length} selected</p>
            )}
          </CardContent>
        </Card>

        {hasSelection && (
          <>
            {/* Team Announcements */}
            <Card className="mb-6 border border-slate-200">
              <CardContent className="pt-6">
                <TeamAnnouncementBanner careRecipientIds={selectedRecipientIds} />
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
                <TaskAssignmentList careRecipientIds={selectedRecipientIds} />
                <SharedCalendarView careRecipientIds={selectedRecipientIds} />
              </div>

              {/* Activity Log */}
              <div>
                <CaregiverActivityLog careRecipientIds={selectedRecipientIds} limit={30} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
