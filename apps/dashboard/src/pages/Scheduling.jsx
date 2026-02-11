import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import {
  useCareRecipients,
  useTeamMembers,
  useCaregiverShifts,
} from '@/hooks';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ShiftForm from '../components/scheduling/ShiftForm';
import ShiftCalendar from '../components/scheduling/ShiftCalendar';
import ShiftList from '../components/scheduling/ShiftList';
import AvailabilityManager from '../components/scheduling/AvailabilityManager';
import ShiftNotifications from '../components/scheduling/ShiftNotifications';

export default function Scheduling() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const { data: recipients = [] } = useCareRecipients();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: shifts = [] } = useCaregiverShifts(
    selectedRecipientId ? { careRecipientId: selectedRecipientId } : undefined
  );

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('caregiver_shifts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver-shifts'] });
      toast.success('Shift deleted');
    },
  });

  const formattedRecipients = recipients.map((r) => ({
    ...r,
    full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  useEffect(() => {
    if (formattedRecipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(formattedRecipients[0].id);
    }
  }, [formattedRecipients, selectedRecipientId]);

  const upcomingShifts = shifts
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 10);

  const adminName = profile?.full_name || 'Me';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <ShiftNotifications />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Calendar className="w-8 h-8 text-teal-600" />
            Shift Scheduling
          </h1>
          <p className="text-slate-500">Manage caregiver shifts and availability</p>
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
                    {formattedRecipients.map((r) => (
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
                className="bg-teal-600 hover:bg-teal-700 gap-2"
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
                  careRecipients={formattedRecipients}
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
