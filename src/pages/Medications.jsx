import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pill, Clock, User, Calendar, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export default function Medications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    care_recipient_id: '',
    name: '',
    dosage: '',
    frequency: 'once_daily',
    times: [],
    instructions: '',
    prescribing_doctor: '',
    refill_date: '',
    active: true
  });
  const [timeInput, setTimeInput] = useState('');

  const queryClient = useQueryClient();

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Medication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Medication.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries(['medications']),
  });

  const resetForm = () => {
    setFormData({
      care_recipient_id: '',
      name: '',
      dosage: '',
      frequency: 'once_daily',
      times: [],
      instructions: '',
      prescribing_doctor: '',
      refill_date: '',
      active: true
    });
    setTimeInput('');
  };

  const handleAddTime = () => {
    if (timeInput && !formData.times.includes(timeInput)) {
      setFormData(prev => ({
        ...prev,
        times: [...prev.times, timeInput]
      }));
      setTimeInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-800 mb-2">Medications</h1>
            <p className="text-slate-500">Track prescriptions and schedules</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Medication</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Care Recipient *</Label>
                  <Select
                    value={formData.care_recipient_id}
                    onValueChange={(value) => setFormData({...formData, care_recipient_id: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.map(recipient => (
                        <SelectItem key={recipient.id} value={recipient.id}>
                          {recipient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Medication Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      placeholder="e.g., 10mg, 2 tablets"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({...formData, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once_daily">Once Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Times to Take</Label>
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddTime} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.times.map((time, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                        {time}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            times: prev.times.filter((_, i) => i !== idx)
                          }))}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    placeholder="Take with food, avoid alcohol, etc."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Prescribing Doctor</Label>
                    <Input
                      id="doctor"
                      value={formData.prescribing_doctor}
                      onChange={(e) => setFormData({...formData, prescribing_doctor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refill">Refill Date</Label>
                    <Input
                      id="refill"
                      type="date"
                      value={formData.refill_date}
                      onChange={(e) => setFormData({...formData, refill_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Adding...' : 'Add Medication'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-16">
            <Pill className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-800 mb-2">No medications tracked</h3>
            <p className="text-slate-500 mb-6">Add your first medication</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {medications.map(med => (
              <div 
                key={med.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-800 mb-1">{med.name}</h3>
                    <p className="text-sm text-slate-600">
                      For: {getRecipientName(med.care_recipient_id)}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: med.id, active: !med.active })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      med.active 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {med.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {med.dosage && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <span className="text-sm font-medium text-slate-700">{med.dosage}</span>
                    <span className="text-sm text-slate-500 ml-2">• {med.frequency?.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {med.times && med.times.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Times</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {med.times.map((time, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {med.instructions && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-600 italic">{med.instructions}</p>
                  </div>
                )}

                <div className="space-y-1 text-xs text-slate-600">
                  {med.prescribing_doctor && (
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-slate-400" />
                      Dr. {med.prescribing_doctor}
                    </div>
                  )}
                  {med.refill_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Refill: {format(parseISO(med.refill_date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}