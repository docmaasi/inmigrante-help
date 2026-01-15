import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TaskAssignmentList from '../components/collaboration/TaskAssignmentList';
import CaregiverActivityLog from '../components/collaboration/CaregiverActivityLog';
import SharedCalendarView from '../components/collaboration/SharedCalendarView';
import InviteTeamMemberDialog from '../components/team/InviteTeamMemberDialog';

export default function Collaboration() {
  const [user, setUser] = useState(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', selectedRecipientId],
    queryFn: () => selectedRecipientId
      ? base44.entities.TeamMember.filter({
          care_recipient_id: selectedRecipientId,
          active: true
        })
      : [],
    enabled: !!selectedRecipientId
  });

  // Set first recipient as default
  React.useEffect(() => {
    if (recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id);
    }
  }, [recipients, selectedRecipientId]);

  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                Team Collaboration
              </h1>
              <p className="text-slate-500">Coordinate care, assign tasks, and track team activity</p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('CommunicationHub')}>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Messages
                </Button>
              </Link>
              <Button 
                onClick={() => setShowInviteDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite Member
              </Button>
            </div>
          </div>
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
                  {recipients.map(recipient => (
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
                      <div key={member.id} className="p-4 border border-slate-200 rounded-lg">
                        <p className="font-medium text-slate-800">{member.full_name}</p>
                        <p className="text-xs text-slate-500 mt-1">
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

        <InviteTeamMemberDialog 
          open={showInviteDialog} 
          onClose={() => setShowInviteDialog(false)} 
        />
      </div>
    </div>
  );
}