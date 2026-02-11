import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../shared/FileUpload';
import RecipientCheckboxList from '../shared/RecipientCheckboxList';

export default function MedicationForm({ medication, recipients, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!medication?.id;
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(() => {
    if (medication?.care_recipient_id) return [medication.care_recipient_id];
    return [];
  });
  const [formData, setFormData] = useState(medication || {
    care_recipient_id: '',
    medication_name: '',
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
    active: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (medication?.id) {
        return base44.entities.Medication.update(medication.id, data);
      }
      return base44.entities.Medication.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medications']);
      if (isEditing) {
        toast.success('Medication updated');
        onClose();
      }
    }
  });

  // Search medications with debouncing
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
        const result = await base44.functions.invoke('search-medications', { query: searchQuery });
        setSuggestions(result.results || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching medications:', error);
        toast.error('Failed to search medications');
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

  // Close suggestions when clicking outside
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
      medication_name: med.name,
      dosage: med.dosage || formData.dosage
    });
    setSearchQuery(med.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medication_name || !formData.dosage) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditing) {
      const recipientId = selectedRecipientIds[0] || formData.care_recipient_id;
      if (!recipientId) {
        toast.error('Please select a care recipient');
        return;
      }
      try {
        await saveMutation.mutateAsync({ ...formData, care_recipient_id: recipientId });
      } catch {
        toast.error('Failed to update medication');
      }
      return;
    }

    if (selectedRecipientIds.length === 0) {
      toast.error('Please select at least one care recipient');
      return;
    }

    try {
      for (const recipientId of selectedRecipientIds) {
        await saveMutation.mutateAsync({ ...formData, care_recipient_id: recipientId });
      }
      const count = selectedRecipientIds.length;
      toast.success(count === 1 ? 'Medication added' : `${count} medications added`);
      onClose();
    } catch {
      toast.error('Failed to add medication');
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
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="care_recipient_id">Care Recipient *</Label>
              <Select
                value={selectedRecipientIds[0] || formData.care_recipient_id}
                onValueChange={(value) => setSelectedRecipientIds([value])}
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
          ) : (
            <RecipientCheckboxList
              careRecipients={recipients}
              selectedIds={selectedRecipientIds}
              onChange={setSelectedRecipientIds}
            />
          )}

          <div className="space-y-2 relative" ref={suggestionsRef}>
            <Label htmlFor="medication_name">Medication Name *</Label>
            <div className="relative">
              <Input
                id="medication_name"
                value={searchQuery || formData.medication_name}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFormData({ ...formData, medication_name: e.target.value });
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
                      {med.dosage && <span>• {med.dosage}</span>}
                      {med.form && <span>• {med.form}</span>}
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
              disabled={saveMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {saveMutation.isPending ? (
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