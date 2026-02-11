import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';
import ShiftForm from '../components/scheduling/ShiftForm';
import ShiftCalendar from '../components/scheduling/ShiftCalendar';
import ShiftList from '../components/scheduling/ShiftList';
import AvailabilityManager from '../components/scheduling/AvailabilityManager';
import ShiftNotifications from '../components/scheduling/ShiftNotifications';

export default function Scheduling() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', selectedRecipientId],
    queryFn: () =>
      selectedRecipientId
        ? base44.entities.CaregiverShift.filter(
            { care_recipient_id: selectedRecipientId },
            '-start_date'
          )
        : [],
    enabled: !!selectedRecipientId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverShift.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts']);
      toast.success('Shift deleted');
    },
  });

  useEffect(() => {
    if (recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id);
    }
  }, [recipients, selectedRecipientId]);

  const upcomingShifts = shifts
    .filter((s) => s.status === 'scheduled')
    .sort(
      (a, b) =>
        new Date(`${a.start_date}T${a.start_time}`) -
        new Date(`${b.start_date}T${b.start_time}`)
    )
    .slice(0, 10);

  const adminName = user?.full_name || 'Me';

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <ShiftNotifications />

      <div className="max-w-7xl mx-auto relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Shift Scheduling
          </h1>
          <p className="text-slate-700">Manage caregiver shifts and availability</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 max-w-xs">
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Care Recipient
                </label>
                <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => {
                  setEditingShift(null);
                  setShowShiftForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                disabled={!selectedRecipientId}
              >
                <Plus className="w-4 h-4" />
                Create Shift
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedRecipientId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {showShiftForm ? (
                <ShiftForm
                  shift={editingShift}
                  careRecipients={recipients}
                  teamMembers={teamMembers}
                  onClose={() => {
                    setShowShiftForm(false);
                    setEditingShift(null);
                  }}
                />
              ) : (
                <>
                  <ShiftList
                    shifts={upcomingShifts}
                    teamMembers={teamMembers}
                    adminName={adminName}
                    onEdit={(shift) => {
                      setEditingShift(shift);
                      setShowShiftForm(true);
                    }}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                  <ShiftCalendar
                    careRecipientId={selectedRecipientId}
                    adminName={adminName}
                  />
                </>
              )}
            </div>

            <div className="space-y-4">
              <AvailabilityManager
                caregiverName={`${adminName} (Me)`}
                isSelf={true}
                teamMemberId={null}
              />
              {teamMembers.map((member) => (
                <AvailabilityManager
                  key={member.id}
                  caregiverName={member.full_name}
                  teamMemberId={member.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
