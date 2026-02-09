import React, { useState, useCallback } from 'react';
import { useCreateCareRecipient, useUpdateCareRecipient } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import MedicalAutocomplete from '../shared/MedicalAutocomplete';

export function CareRecipientForm({ recipient, onClose }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (recipient) {
      return {
        ...recipient,
        // Convert allergies array from DB back to comma-separated string for the form
        allergies: Array.isArray(recipient.allergies)
          ? recipient.allergies.join(', ')
          : recipient.allergies || '',
        date_of_birth: recipient.date_of_birth || '',
      };
    }
    return {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      photo_url: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      primary_condition: '',
      conditions_diagnoses: '[]',
      medical_history: '[]',
      allergies: '',
      dietary_restrictions: '',
      emergency_contact_name: '',
      emergency_contact_relationship: '',
      emergency_contact_phone: '',
      emergency_contact_email: '',
      secondary_emergency_contact_name: '',
      secondary_emergency_contact_relationship: '',
      secondary_emergency_contact_phone: '',
      secondary_emergency_contact_email: '',
      primary_physician: '',
      physician_phone: '',
      notes: '',
    };
  });

  const [conditions, setConditions] = useState(() => {
    try {
      return recipient?.conditions_diagnoses ? JSON.parse(recipient.conditions_diagnoses) : [];
    } catch {
      return [];
    }
  });

  const [medicalHistory, setMedicalHistory] = useState(() => {
    try {
      return recipient?.medical_history ? JSON.parse(recipient.medical_history) : [];
    } catch {
      return [];
    }
  });

  const [newCondition, setNewCondition] = useState({ condition: '', diagnosed_date: '' });
  const [newHistory, setNewHistory] = useState({ event: '', date: '', notes: '' });

  const createMutation = useCreateCareRecipient();
  const updateMutation = useUpdateCareRecipient();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleZipChange = useCallback(async (zip) => {
    setFormData((prev) => ({ ...prev, zip_code: zip }));
    const cleanZip = zip.replace(/\D/g, '');
    if (cleanZip.length !== 5) return;

    try {
      const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
      if (!res.ok) return;
      const data = await res.json();
      const place = data.places?.[0];
      if (place) {
        setFormData((prev) => ({
          ...prev,
          city: place['place name'],
          state: place['state abbreviation'],
        }));
      }
    } catch {
      // Silently fail — user can still type city/state manually
    }
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user?.id}/care-recipients/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: publicUrl });
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      toast.error('Please enter first and last name');
      return;
    }

    // Auto-include any typed-but-not-added condition or history item
    const finalConditions = newCondition.condition.trim()
      ? [...conditions, newCondition]
      : conditions;
    const finalHistory = newHistory.event.trim()
      ? [...medicalHistory, newHistory]
      : medicalHistory;

    const dataToSave = {
      ...formData,
      // Combine first + last name into full_name for display in dropdowns
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      conditions_diagnoses: JSON.stringify(finalConditions),
      medical_history: JSON.stringify(finalHistory),
      // Convert allergies string to array format the database expects
      allergies: formData.allergies
        ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean)
        : null,
      // Convert empty date to null so the database doesn't reject it
      date_of_birth: formData.date_of_birth || null,
    };

    try {
      if (recipient?.id) {
        await updateMutation.mutateAsync({ id: recipient.id, ...dataToSave });
        toast.success('Care recipient updated');
      } else {
        await createMutation.mutateAsync(dataToSave);
        toast.success('Care recipient added');
      }
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save care recipient');
    }
  };

  const addCondition = () => {
    if (newCondition.condition.trim()) {
      setConditions([...conditions, newCondition]);
      setNewCondition({ condition: '', diagnosed_date: '' });
    }
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addHistory = () => {
    if (newHistory.event.trim()) {
      setMedicalHistory([...medicalHistory, newHistory]);
      setNewHistory({ event: '', date: '', notes: '' });
    }
  };

  const removeHistory = (index) => {
    setMedicalHistory(medicalHistory.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {recipient ? 'Edit Care Recipient' : 'Add Care Recipient'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            {formData.photo_url ? (
              <img src={formData.photo_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </>
                  )}
                </div>
              </Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Address</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleZipChange(e.target.value)}
                  placeholder="12345"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_condition">Primary Condition</Label>
                <MedicalAutocomplete
                  type="condition"
                  id="primary_condition"
                  value={formData.primary_condition}
                  onChange={(val) => setFormData({ ...formData, primary_condition: val })}
                  placeholder="Start typing... e.g., Alzheimer's, Diabetes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <MedicalAutocomplete
                  type="allergy"
                  id="allergies"
                  value={formData.allergies}
                  onChange={(val) => setFormData({ ...formData, allergies: val })}
                  placeholder="Start typing... e.g., Penicillin, Peanuts"
                />
              </div>
            </div>

            {/* Conditions & Diagnoses */}
            <div className="space-y-2">
              <Label>Conditions & Diagnoses</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <MedicalAutocomplete
                  type="condition"
                  value={newCondition.condition}
                  onChange={(val) => setNewCondition({ ...newCondition, condition: val })}
                  placeholder="Start typing condition..."
                />
                <Input
                  type="date"
                  placeholder="Diagnosed date"
                  value={newCondition.diagnosed_date}
                  onChange={(e) => setNewCondition({ ...newCondition, diagnosed_date: e.target.value })}
                />
                <Button type="button" onClick={addCondition} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {conditions.length > 0 && (
                <div className="space-y-1 mt-2">
                  {conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{cond.condition}</span>
                        {cond.diagnosed_date && (
                          <span className="text-xs text-slate-500 ml-2">
                            {format(parseISO(cond.diagnosed_date), 'MMM yyyy')}
                          </span>
                        )}
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCondition(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical History */}
            <div className="space-y-2">
              <Label>Medical History (Surgeries, Illnesses)</Label>
              <div className="grid grid-cols-1 gap-2">
                <MedicalAutocomplete
                  type="medical_event"
                  value={newHistory.event}
                  onChange={(val) => setNewHistory({ ...newHistory, event: val })}
                  placeholder="Start typing... e.g., Hip replacement surgery"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Date"
                    value={newHistory.date}
                    onChange={(e) => setNewHistory({ ...newHistory, date: e.target.value })}
                  />
                  <Input
                    placeholder="Additional notes"
                    value={newHistory.notes}
                    onChange={(e) => setNewHistory({ ...newHistory, notes: e.target.value })}
                  />
                </div>
                <Button type="button" onClick={addHistory} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add History Item
                </Button>
              </div>
              {medicalHistory.length > 0 && (
                <div className="space-y-1 mt-2">
                  {medicalHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-start justify-between p-2 bg-slate-50 rounded border">
                      <div className="flex-1">
                        <span className="font-medium text-sm block">{hist.event}</span>
                        <div className="text-xs text-slate-500">
                          {hist.date && format(parseISO(hist.date), 'MMM yyyy')}
                          {hist.notes && ` - ${hist.notes}`}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeHistory(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_restrictions">Dietary Restrictions/Preferences</Label>
              <MedicalAutocomplete
                type="dietary"
                id="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={(val) => setFormData({ ...formData, dietary_restrictions: val })}
                placeholder="Start typing... e.g., Diabetic Diet, Low Sodium, Gluten-Free"
              />
            </div>
          </div>

          {/* Physician Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Primary Physician</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_physician">Doctor Name</Label>
                <Input
                  id="primary_physician"
                  value={formData.primary_physician}
                  onChange={(e) => setFormData({ ...formData, primary_physician: e.target.value })}
                  placeholder="Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physician_phone">Doctor Phone</Label>
                <Input
                  id="physician_phone"
                  value={formData.physician_phone}
                  onChange={(e) => setFormData({ ...formData, physician_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Primary Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                  placeholder="Son, Daughter, Spouse..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_email">Contact Email</Label>
                <Input
                  id="emergency_contact_email"
                  type="email"
                  value={formData.emergency_contact_email}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide mt-4">Secondary Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secondary_emergency_contact_name">Contact Name</Label>
                <Input
                  id="secondary_emergency_contact_name"
                  value={formData.secondary_emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, secondary_emergency_contact_name: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_emergency_contact_relationship">Relationship</Label>
                <Input
                  id="secondary_emergency_contact_relationship"
                  value={formData.secondary_emergency_contact_relationship}
                  onChange={(e) => setFormData({ ...formData, secondary_emergency_contact_relationship: e.target.value })}
                  placeholder="Son, Daughter, Spouse..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="secondary_emergency_contact_phone"
                  value={formData.secondary_emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, secondary_emergency_contact_phone: e.target.value })}
                  placeholder="(555) 987-6543"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_emergency_contact_email">Contact Email</Label>
                <Input
                  id="secondary_emergency_contact_email"
                  type="email"
                  value={formData.secondary_emergency_contact_email}
                  onChange={(e) => setFormData({ ...formData, secondary_emergency_contact_email: e.target.value })}
                  placeholder="jane@example.com"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other important information..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : recipient ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default CareRecipientForm;
