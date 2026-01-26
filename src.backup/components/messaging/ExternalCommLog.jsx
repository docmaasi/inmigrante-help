import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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

export default function ExternalCommLog() {
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

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['externalCommunications'],
    queryFn: () => base44.entities.ExternalCommunication.list('-communication_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ExternalCommunication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['externalCommunications']);
      toast.success('Communication logged');
      handleCloseDialog();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ExternalCommunication.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['externalCommunications']);
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
    setFormData({
      care_recipient_id: log.care_recipient_id,
      contact_type: log.contact_type,
      contact_name: log.contact_name,
      contact_phone: log.contact_phone || '',
      contact_email: log.contact_email || '',
      communication_date: log.communication_date,
      communication_time: log.communication_time || '',
      method: log.method,
      regarding: log.regarding,
      notes: log.notes || '',
      follow_up_needed: log.follow_up_needed || false,
      follow_up_date: log.follow_up_date || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, logged_by: user?.email };
    
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
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
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
            const MethodIcon = getMethodIcon(log.method);
            
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
                            {format(parseISO(log.communication_date), 'MMM d, yyyy')}
                          </span>
                          {log.communication_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {log.communication_time}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MethodIcon className="w-4 h-4" />
                            {log.method}
                          </span>
                        </div>
                        
                        <p className="font-medium text-slate-700">Re: {log.regarding}</p>
                        
                        {log.notes && (
                          <p className="text-slate-600 bg-slate-50 rounded p-2 text-xs">{log.notes}</p>
                        )}
                        
                        {log.follow_up_needed && (
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

      {/* Log Communication Dialog */}
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
                      <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
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