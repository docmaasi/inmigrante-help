import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ShiftForm from '../components/scheduling/ShiftForm';
import ShiftCalendar from '../components/scheduling/ShiftCalendar';
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
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts', selectedRecipientId],
    queryFn: () => selectedRecipientId
      ? base44.entities.CaregiverShift.filter({ care_recipient_id: selectedRecipientId }, '-start_date')
      : [],
    enabled: !!selectedRecipientId
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverShift.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts']);
      toast.success('Shift deleted');
    }
  });

  // Set first recipient as default
  React.useEffect(() => {
    if (recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id);
    }
  }, [recipients, selectedRecipientId]);

  const upcomingShifts = shifts
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(`${a.start_date}T${a.start_time}`) - new Date(`${b.start_date}T${b.start_time}`))
    .slice(0, 10);

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/52ada0314_Untitleddesign15.png)'
        }}
      />
      <ShiftNotifications />

      <div className="max-w-7xl mx-auto relative">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Shift Scheduling
          </h1>
          <p className="text-slate-700">Manage caregiver shifts and availability</p>
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
                    {recipients.map(r => (
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
            {/* Shift List */}
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {upcomingShifts.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4">No upcoming shifts</p>
                      ) : (
                        upcomingShifts.map(shift => (
                          <div key={shift.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-800">{shift.caregiver_name}</h3>
                                <p className="text-xs text-slate-600 mt-1">
                                  {format(new Date(shift.start_date), 'MMM d, yyyy')} • {shift.start_time} - {shift.end_time}
                                </p>
                                {shift.notes && (
                                  <p className="text-xs text-slate-500 mt-1">{shift.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={statusColors[shift.status]}>
                                  {shift.status}
                                </Badge>
                                {shift.recurring !== 'none' && (
                                  <Badge variant="outline" className="text-xs">
                                    {shift.recurring}
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
                  caregiverEmail={member.user_email}
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