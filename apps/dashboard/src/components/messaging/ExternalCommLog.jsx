import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useCareRecipients } from '@/hooks/use-care-recipients';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Stethoscope, Building2, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

export function ExternalCommLog() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [formData, setFormData] = useState({
    care_recipient_id: '',
    contact_type: 'doctor',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    communication_date: new Date().toISOString().split('T')[0],
    communication_time: '',
    method: 'phone',
    regarding: '',
    notes: '',
    follow_up_needed: false,
    follow_up_date: ''
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: recipients = [] } = useCareRecipients();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['external-communications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_communications')
        .select('*')
        .order('occurred_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('external_communications')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-communications'] });
      toast.success('Communication logged');
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('external_communications')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-communications'] });
      toast.success('Communication updated');
      handleCloseDialog();
    }
  });

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingLog(null);
    setFormData({
      care_recipient_id: '',
      contact_type: 'doctor',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      communication_date: new Date().toISOString().split('T')[0],
      communication_time: '',
      method: 'phone',
      regarding: '',
      notes: '',
      follow_up_needed: false,
      follow_up_date: ''
    });
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    const occurredAt = log.occurred_at ? new Date(log.occurred_at) : null;
    setFormData({
      care_recipient_id: log.care_recipient_id,
      contact_type: log.contact_type,
      contact_name: log.contact_name,
      contact_phone: log.contact_info || '',
      contact_email: '',
      communication_date: occurredAt
        ? occurredAt.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      communication_time: occurredAt
        ? format(occurredAt, 'HH:mm')
        : '',
      method: log.communication_type || 'phone',
      regarding: log.subject || '',
      notes: log.content || '',
      follow_up_needed: log.follow_up_required || false,
      follow_up_date: log.follow_up_date || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map form field names to actual database column names
    const data = {
      care_recipient_id: formData.care_recipient_id,
      contact_type: formData.contact_type,
      contact_name: formData.contact_name,
      contact_info: [formData.contact_phone, formData.contact_email]
        .filter(Boolean).join(', ') || null,
      communication_type: formData.method,
      subject: formData.regarding,
      content: formData.notes || null,
      occurred_at: formData.communication_time
        ? `${formData.communication_date}T${formData.communication_time}:00`
        : `${formData.communication_date}T00:00:00`,
      follow_up_required: formData.follow_up_needed,
      follow_up_date: formData.follow_up_date || null,
    };

    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getContactIcon = (type) => {
    switch(type) {
      case 'doctor':
      case 'specialist':
      case 'therapist':
        return Stethoscope;
      case 'hospital':
      case 'pharmacy':
      case 'insurance':
        return Building2;
      default:
        return Phone;
    }
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'email': return Mail;
      case 'phone': return Phone;
      default: return Phone;
    }
  };

  const typeColors = {
    doctor: 'bg-blue-100 text-blue-700',
    pharmacy: 'bg-green-100 text-green-700',
    hospital: 'bg-red-100 text-red-700',
    insurance: 'bg-purple-100 text-purple-700',
    therapist: 'bg-cyan-100 text-cyan-700',
    specialist: 'bg-indigo-100 text-indigo-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    return recipient ? `${recipient.first_name} ${recipient.last_name}` : 'Unknown';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">External Communications</h3>
          <p className="text-sm text-slate-500">Log calls and emails with doctors, pharmacies, etc.</p>
        </div>
        <Button onClick={() => setShowDialog(true)} size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Log Communication
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No communications logged yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map(log => {
            const Icon = getContactIcon(log.contact_type);
            const MethodIcon = getMethodIcon(log.communication_type);

            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[log.contact_type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{log.contact_name}</h4>
                          <p className="text-sm text-slate-600">{getRecipientName(log.care_recipient_id)}</p>
                        </div>
                        <Badge className={typeColors[log.contact_type]}>
                          {log.contact_type}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-4 flex-wrap text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {log.occurred_at && format(new Date(log.occurred_at), 'MMM d, yyyy')}
                          </span>
                          {log.occurred_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(log.occurred_at), 'h:mm a')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MethodIcon className="w-4 h-4" />
                            {log.communication_type}
                          </span>
                        </div>

                        <p className="font-medium text-slate-700">Re: {log.subject}</p>

                        {log.content && (
                          <p className="text-slate-600 bg-slate-50 rounded p-2 text-xs">{log.content}</p>
                        )}

                        {log.follow_up_required && (
                          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 rounded p-2">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Follow-up needed
                              {log.follow_up_date && ` by ${format(parseISO(log.follow_up_date), 'MMM d, yyyy')}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(log)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLog ? 'Edit Communication' : 'Log External Communication'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Care Recipient *</Label>
                <Select value={formData.care_recipient_id} onValueChange={(v) => setFormData({...formData, care_recipient_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contact Type *</Label>
                <Select value={formData.contact_type} onValueChange={(v) => setFormData({...formData, contact_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Contact Name *</Label>
              <Input value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={formData.communication_date} onChange={(e) => setFormData({...formData, communication_date: e.target.value})} required />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={formData.communication_time} onChange={(e) => setFormData({...formData, communication_time: e.target.value})} />
              </div>
              <div>
                <Label>Method *</Label>
                <Select value={formData.method} onValueChange={(v) => setFormData({...formData, method: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="video_call">Video Call</SelectItem>
                    <SelectItem value="portal">Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Regarding *</Label>
              <Input placeholder="e.g., Medication refill, test results" value={formData.regarding} onChange={(e) => setFormData({...formData, regarding: e.target.value})} required />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.follow_up_needed}
                  onChange={(e) => setFormData({...formData, follow_up_needed: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm">Follow-up needed</span>
              </label>
              {formData.follow_up_needed && (
                <div>
                  <Label>Follow-up Date</Label>
                  <Input type="date" value={formData.follow_up_date} onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit">{editingLog ? 'Update' : 'Log Communication'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExternalCommLog;
