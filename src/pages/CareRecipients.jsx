import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import RecipientCard from '../components/recipients/RecipientCard';

export default function CareRecipients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    date_of_birth: '',
    primary_doctor: '',
    emergency_contact: '',
    emergency_phone: '',
    medical_conditions: [],
    allergies: [],
    notes: ''
  });
  const [conditionInput, setConditionInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const queryClient = useQueryClient();

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CareRecipient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['recipients']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      date_of_birth: '',
      primary_doctor: '',
      emergency_contact: '',
      emergency_phone: '',
      medical_conditions: [],
      allergies: [],
      notes: ''
    });
    setConditionInput('');
    setAllergyInput('');
  };

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medical_conditions: [...prev.medical_conditions, conditionInput.trim()]
      }));
      setConditionInput('');
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-slate-800 mb-2">Care Recipients</h1>
            <p className="text-slate-500">Manage profiles for your loved ones</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Recipient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Care Recipient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={formData.relationship}
                      onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                      placeholder="Mother, Father, Spouse..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Primary Doctor</Label>
                    <Input
                      id="doctor"
                      value={formData.primary_doctor}
                      onChange={(e) => setFormData({...formData, primary_doctor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input
                      id="emergency"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Emergency Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <div className="flex gap-2">
                    <Input
                      value={conditionInput}
                      onChange={(e) => setConditionInput(e.target.value)}
                      placeholder="Enter condition"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                    />
                    <Button type="button" onClick={handleAddCondition} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.medical_conditions.map((condition, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                        {condition}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            medical_conditions: prev.medical_conditions.filter((_, i) => i !== idx)
                          }))}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <div className="flex gap-2">
                    <Input
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      placeholder="Enter allergy"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                    />
                    <Button type="button" onClick={handleAddAllergy} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            allergies: prev.allergies.filter((_, i) => i !== idx)
                          }))}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Recipient'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : recipients.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">No care recipients yet</h3>
            <p className="text-slate-500 mb-6">Add your first care recipient to get started</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.map(recipient => (
              <RecipientCard key={recipient.id} recipient={recipient} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}