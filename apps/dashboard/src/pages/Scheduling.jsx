import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import {
  useCareRecipients,
  useTeamMembers,
  useCaregiverShifts,
  useUpdateShift,
} from '@/hooks';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ShiftForm from '../components/scheduling/ShiftForm';
import ShiftCalendar from '../components/scheduling/ShiftCalendar';
import AvailabilityManager from '../components/scheduling/AvailabilityManager';
import ShiftNotifications from '../components/scheduling/ShiftNotifications';

export default function Scheduling() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
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

  const upcomingShifts = shifts
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 10);

  const statusColors = {
    scheduled: 'bg-teal-100 text-teal-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const getShiftDate = (shift) => {
    if (shift.start_time) {
      return format(new Date(shift.start_time), 'MMM d, yyyy');
    }
    return 'No date';
  };

  const getShiftTimeRange = (shift) => {
    if (shift.start_time && shift.end_time) {
      const start = format(new Date(shift.start_time), 'h:mm a');
      const end = format(new Date(shift.end_time), 'h:mm a');
      return `${start} - ${end}`;
    }
    return '';
  };

  const getCaregiverName = (shift) => {
    if (shift.team_members?.full_name) {
      return shift.team_members.full_name;
    }
    const member = teamMembers.find(m => m.id === shift.team_member_id);
    return member?.full_name || 'Unassigned';
  };

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

        {/* Recipient & Actions */}
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
                    {formattedRecipients.map(r => (
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
            {/* Shift List */}
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {upcomingShifts.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">No upcoming shifts</p>
                      ) : (
                        upcomingShifts.map(shift => (
                          <div key={shift.id} className="p-3 border border-slate-200 rounded-lg hover:border-teal-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-800">{getCaregiverName(shift)}</h3>
                                <p className="text-xs text-slate-600 mt-1">
                                  {getShiftDate(shift)} - {getShiftTimeRange(shift)}
                                </p>
                                {shift.notes && (
                                  <p className="text-xs text-slate-500 mt-1">{shift.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={statusColors[shift.status] || statusColors.scheduled}>
                                  {shift.status || 'scheduled'}
                                </Badge>
                                {shift.is_recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingShift(shift);
                                  setShowShiftForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteMutation.mutate(shift.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <ShiftCalendar careRecipientId={selectedRecipientId} />
                </>
              )}
            </div>

            {/* Caregiver Availability */}
            <div className="space-y-6">
              {teamMembers.map(member => (
                <AvailabilityManager
                  key={member.id}
                  caregiverEmail={member.email}
                  caregiverName={member.full_name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
