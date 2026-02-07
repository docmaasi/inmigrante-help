import React, { useState, useEffect, useRef } from 'react';
import { useCreateMedication, useUpdateMedication } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../shared/FileUpload';
import { errorHandlers } from "@/lib/error-handler";

const searchMedications = async (query) => {
  try {
    const { data, error } = await supabase.functions.invoke('search-medications', {
      body: { query }
    });
    if (error) throw error;
    return data?.results || [];
  } catch (error) {
    console.error('Medication search error:', error);
    return [];
  }
};

export function MedicationForm({ medication, recipients, onClose }) {
  const [formData, setFormData] = useState(medication || {
    care_recipient_id: '',
    name: '',
    dosage: '',
    frequency: '',
    time_of_day: '',
    purpose: '',
    prescribing_doctor: '',
    start_date: '',
    refill_date: '',
    pharmacy: '',
    special_instructions: '',
    photo_url: '',
    is_active: true
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  const createMutation = useCreateMedication();
  const updateMutation = useUpdateMedication();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchMedications(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        // Silent fail for search - user can still enter manually
        console.error('Medication search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMedicationSelect = (med) => {
    setFormData({
      ...formData,
      name: med.name,
      dosage: med.dosage || formData.dosage
    });
    setSearchQuery(med.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.care_recipient_id) {
      toast.error('Please select who this medication is for.');
      return;
    }
    if (!formData.name) {
      toast.error('Please enter the medication name.');
      return;
    }
    if (!formData.dosage) {
      toast.error('Please enter the dosage (e.g., 10mg, 2 tablets).');
      return;
    }

    const dataToSave = {
      care_recipient_id: formData.care_recipient_id,
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency || null,
      schedule_times: formData.time_of_day
        ? [formData.time_of_day]
        : null,
      notes: formData.purpose || null,
      prescriber: formData.prescribing_doctor || null,
      start_date: formData.start_date || null,
      end_date: formData.refill_date || null,
      pharmacy: formData.pharmacy || null,
      instructions: formData.special_instructions || null,
      is_active: formData.is_active
    };

    try {
      if (medication?.id) {
        await updateMutation.mutateAsync({ id: medication.id, ...dataToSave });
        toast.success('Medication updated successfully!');
      } else {
        await createMutation.mutateAsync(dataToSave);
        toast.success('Medication added successfully!');
      }
      onClose();
    } catch (error) {
      errorHandlers.save('medication', error);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {medication ? 'Edit Medication' : 'Add Medication'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="care_recipient_id">Care Recipient *</Label>
            <Select
              value={formData.care_recipient_id}
              onValueChange={(value) => setFormData({ ...formData, care_recipient_id: value })}
            >
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

          <div className="space-y-2 relative" ref={suggestionsRef}>
            <Label htmlFor="name">Medication Name *</Label>
            <div className="relative">
              <Input
                id="name"
                value={searchQuery || formData.name}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFormData({ ...formData, name: e.target.value });
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Start typing medication name..."
                required
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              )}
              {!isSearching && searchQuery.length >= 2 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((med, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleMedicationSelect(med)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-slate-900">{med.name}</div>
                    <div className="flex gap-2 mt-1 text-xs text-slate-500">
                      {med.generic_name && med.generic_name !== med.name && (
                        <span>Generic: {med.generic_name}</span>
                      )}
                      {med.dosage && <span>- {med.dosage}</span>}
                      {med.form && <span>- {med.form}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && !isSearching && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm text-slate-500">
                No medications found. You can still enter manually.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 10mg, 2 tablets"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Once daily, Twice daily"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time_of_day">Time of Day</Label>
              <Input
                id="time_of_day"
                value={formData.time_of_day}
                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                placeholder="e.g., Morning, 8:00 AM"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescribing_doctor">Prescribing Doctor</Label>
              <Input
                id="prescribing_doctor"
                value={formData.prescribing_doctor}
                onChange={(e) => setFormData({ ...formData, prescribing_doctor: e.target.value })}
                placeholder="Doctor's name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="What this medication is for"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refill_date">Next Refill Date</Label>
              <Input
                id="refill_date"
                type="date"
                value={formData.refill_date}
                onChange={(e) => setFormData({ ...formData, refill_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pharmacy">Pharmacy</Label>
            <Input
              id="pharmacy"
              value={formData.pharmacy}
              onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
              placeholder="Pharmacy name and location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              placeholder="e.g., Take with food, Avoid grapefruit"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Medication Photo</Label>
            <FileUpload
              value={formData.photo_url}
              onChange={(url) => setFormData({ ...formData, photo_url: url })}
              label="Upload Medication Photo"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : medication ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default MedicationForm;
