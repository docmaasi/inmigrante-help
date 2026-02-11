import React, { useState, useEffect, useRef } from 'react';
import { useCreateMedication, useUpdateMedication } from '@/hooks';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../shared/FileUpload';
import { errorHandlers } from "@/lib/error-handler";
import { filterDosageOptions, filterFrequencyOptions, DOSAGE_OPTIONS, FREQUENCY_OPTIONS } from '@/lib/medication-options';

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

const searchPharmacies = async (zipCode, query) => {
  try {
    const { data, error } = await supabase.functions.invoke('search-pharmacies', {
      body: { zip_code: zipCode, query }
    });
    if (error) throw error;
    return data?.results || [];
  } catch (error) {
    console.error('Pharmacy search error:', error);
    return [];
  }
};

// Convert "14:30" → "2:30 PM"
const formatTimeTo12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
};

// Parse existing "Morning, 8:00 AM" into { period, time24 }
const parseTimeOfDay = (value) => {
  if (!value) return { period: '', time24: '' };
  const parts = value.split(', ');
  const period = parts[0] || '';
  const timeStr = parts[1] || '';
  // Convert "8:00 AM" → "08:00"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { period, time24: '' };
  let hour = parseInt(match[1], 10);
  const min = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return { period, time24: `${String(hour).padStart(2, '0')}:${min}` };
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

  // Time picker state — parse existing value if editing
  const parsedTime = parseTimeOfDay(formData.time_of_day);
  const [timePeriod, setTimePeriod] = useState(parsedTime.period);
  const [timeValue, setTimeValue] = useState(parsedTime.time24);

  // Zip code override state
  const [zipSource, setZipSource] = useState('none'); // 'recipient' | 'custom' | 'none'

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Pharmacy search state
  const [pharmacyQuery, setPharmacyQuery] = useState(formData.pharmacy || '');
  const [pharmacySuggestions, setPharmacySuggestions] = useState([]);
  const [showPharmacySuggestions, setShowPharmacySuggestions] = useState(false);
  const [isSearchingPharmacy, setIsSearchingPharmacy] = useState(false);
  const [recipientZipCode, setRecipientZipCode] = useState('');
  const pharmacyTimeoutRef = useRef(null);
  const pharmacyRef = useRef(null);

  // Dosage autocomplete state
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [showDosageSuggestions, setShowDosageSuggestions] = useState(false);
  const dosageRef = useRef(null);

  // Frequency autocomplete state
  const [frequencySuggestions, setFrequencySuggestions] = useState([]);
  const [showFrequencySuggestions, setShowFrequencySuggestions] = useState(false);
  const frequencyRef = useRef(null);

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

  // Look up recipient's zip code when they select a care recipient
  useEffect(() => {
    if (formData.care_recipient_id && recipients) {
      const recipient = recipients.find(r => r.id === formData.care_recipient_id);
      if (recipient?.zip_code) {
        setRecipientZipCode(recipient.zip_code);
        setZipSource('recipient');
        // Auto-load pharmacies near the recipient
        searchPharmacies(recipient.zip_code).then(results => {
          setPharmacySuggestions(results);
        });
      } else {
        setRecipientZipCode('');
        setZipSource('none');
        setPharmacySuggestions([]);
      }
    }
  }, [formData.care_recipient_id, recipients]);

  // Pharmacy search with debounce
  useEffect(() => {
    if (pharmacyTimeoutRef.current) {
      clearTimeout(pharmacyTimeoutRef.current);
    }

    if (!recipientZipCode) return;

    if (pharmacyQuery.length >= 2) {
      setIsSearchingPharmacy(true);
      pharmacyTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchPharmacies(recipientZipCode, pharmacyQuery);
          setPharmacySuggestions(results);
          setShowPharmacySuggestions(true);
        } catch {
          // Silent fail
        } finally {
          setIsSearchingPharmacy(false);
        }
      }, 300);
    } else if (pharmacyQuery.length === 0 && recipientZipCode) {
      // Show all nearby pharmacies when field is empty
      searchPharmacies(recipientZipCode).then(results => {
        setPharmacySuggestions(results);
      });
    }

    return () => {
      if (pharmacyTimeoutRef.current) clearTimeout(pharmacyTimeoutRef.current);
    };
  }, [pharmacyQuery, recipientZipCode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (pharmacyRef.current && !pharmacyRef.current.contains(event.target)) {
        setShowPharmacySuggestions(false);
      }
      if (dosageRef.current && !dosageRef.current.contains(event.target)) {
        setShowDosageSuggestions(false);
      }
      if (frequencyRef.current && !frequencyRef.current.contains(event.target)) {
        setShowFrequencySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMedicationSelect = (med) => {
    setFormData({
      ...formData,
      name: med.name,
      dosage: med.dosage || formData.dosage,
      generic_name: med.generic_name || formData.generic_name || '',
      form: med.form || formData.form || '',
      route: med.route || formData.route || '',
    });
    setSearchQuery(med.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handlePharmacySelect = (pharmacy) => {
    const pharmacyDisplay = `${pharmacy.name} - ${pharmacy.address}, ${pharmacy.city}, ${pharmacy.state} ${pharmacy.zip}`;
    setFormData({
      ...formData,
      pharmacy: pharmacyDisplay,
      pharmacy_phone: pharmacy.phone || '',
    });
    setPharmacyQuery(pharmacyDisplay);
    setShowPharmacySuggestions(false);
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
      generic_name: formData.generic_name || null,
      dosage: formData.dosage,
      form: formData.form || null,
      route: formData.route || null,
      frequency: formData.frequency || null,
      schedule_times: formData.time_of_day
        ? [formData.time_of_day]
        : null,
      notes: formData.purpose || null,
      prescriber: formData.prescribing_doctor || null,
      start_date: formData.start_date || null,
      end_date: formData.refill_date || null,
      pharmacy: formData.pharmacy || null,
      pharmacy_phone: formData.pharmacy_phone || null,
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
                    {recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'}
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
            <div className="space-y-2 relative" ref={dosageRef}>
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, dosage: val });
                  setDosageSuggestions(filterDosageOptions(val));
                  if (val.length >= 1) {
                    setShowDosageSuggestions(true);
                  } else {
                    setShowDosageSuggestions(false);
                  }
                }}
                onFocus={() => {
                  // Show all common options when field is empty, or filtered results
                  if (formData.dosage) {
                    const filtered = filterDosageOptions(formData.dosage);
                    if (filtered.length > 0) {
                      setDosageSuggestions(filtered);
                      setShowDosageSuggestions(true);
                    }
                  } else {
                    setDosageSuggestions(DOSAGE_OPTIONS.slice(0, 12));
                    setShowDosageSuggestions(true);
                  }
                }}
                placeholder="e.g., 10mg, 2 tablets"
                required
              />
              {showDosageSuggestions && dosageSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {dosageSuggestions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, dosage: option });
                        setShowDosageSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors text-sm text-slate-800"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 relative" ref={frequencyRef}>
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, frequency: val });
                  setFrequencySuggestions(filterFrequencyOptions(val));
                  if (val.length >= 1) {
                    setShowFrequencySuggestions(true);
                  } else {
                    setShowFrequencySuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (formData.frequency) {
                    const filtered = filterFrequencyOptions(formData.frequency);
                    if (filtered.length > 0) {
                      setFrequencySuggestions(filtered);
                      setShowFrequencySuggestions(true);
                    }
                  } else {
                    setFrequencySuggestions(FREQUENCY_OPTIONS.slice(0, 10));
                    setShowFrequencySuggestions(true);
                  }
                }}
                placeholder="e.g., Once daily, Twice daily"
              />
              {showFrequencySuggestions && frequencySuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {frequencySuggestions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, frequency: option });
                        setShowFrequencySuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors text-sm text-slate-800"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time of Day</Label>
              <div className="flex gap-2">
                <Select
                  value={timePeriod}
                  onValueChange={(val) => {
                    setTimePeriod(val);
                    const display = timeValue ? formatTimeTo12h(timeValue) : '';
                    setFormData({ ...formData, time_of_day: display ? `${val}, ${display}` : val });
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Afternoon">Afternoon</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTimeValue(val);
                    const display = val ? formatTimeTo12h(val) : '';
                    const combined = timePeriod && display
                      ? `${timePeriod}, ${display}`
                      : timePeriod || display;
                    setFormData({ ...formData, time_of_day: combined });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
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

          <div className="space-y-2 relative" ref={pharmacyRef}>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="pharmacy">Pharmacy</Label>
              </div>
              <div className="w-[140px]">
                <Label htmlFor="pharmacy_zip" className="text-xs">
                  Zip Code
                </Label>
                <div className="relative">
                  <Input
                    id="pharmacy_zip"
                    value={recipientZipCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setRecipientZipCode(val);
                      setZipSource(val ? 'custom' : 'none');
                    }}
                    placeholder="e.g. 90210"
                    maxLength={5}
                    className="pr-7"
                  />
                  <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
                {recipientZipCode && (
                  <p className="text-[10px] mt-0.5 text-slate-500">
                    {zipSource === 'recipient' ? 'From care recipient' : 'Custom zip code'}
                  </p>
                )}
              </div>
            </div>
            <div className="relative">
              <Input
                id="pharmacy"
                value={pharmacyQuery}
                onChange={(e) => {
                  setPharmacyQuery(e.target.value);
                  setFormData({ ...formData, pharmacy: e.target.value });
                }}
                onFocus={() => {
                  if (pharmacySuggestions.length > 0 && recipientZipCode) {
                    setShowPharmacySuggestions(true);
                  }
                }}
                placeholder={recipientZipCode ? "Start typing pharmacy name..." : "Enter a zip code above to search pharmacies"}
              />
              {isSearchingPharmacy && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>

            {showPharmacySuggestions && pharmacySuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {pharmacySuggestions.map((pharmacy, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePharmacySelect(pharmacy)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-slate-900">{pharmacy.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zip}
                    </div>
                    {pharmacy.phone && (
                      <div className="text-xs text-teal-600 mt-0.5">{pharmacy.phone}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!recipientZipCode && formData.care_recipient_id && (
              <p className="text-xs text-amber-600 mt-1">
                Enter a zip code above to search for nearby pharmacies
              </p>
            )}
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
