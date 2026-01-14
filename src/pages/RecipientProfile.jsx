import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Heart, FileText, AlertCircle, Utensils, Phone, Mail, Edit, Pill, Clock, StickyNote } from 'lucide-react';
import { format, parseISO, differenceInYears, isAfter, isBefore, addDays } from 'date-fns';
import CareRecipientForm from '../components/care/CareRecipientForm';

export default function RecipientProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipientId = urlParams.get('id');
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: recipient } = useQuery({
    queryKey: ['careRecipient', recipientId],
    queryFn: async () => {
      const allRecipients = await base44.entities.CareRecipient.list();
      return allRecipients.find(r => r.id === recipientId);
    },
    enabled: !!recipientId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', recipientId],
    queryFn: async () => {
      const all = await base44.entities.Appointment.list();
      return all.filter(apt => apt.care_recipient_id === recipientId);
    },
    enabled: !!recipientId
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications', recipientId],
    queryFn: async () => {
      const all = await base44.entities.Medication.list();
      return all.filter(med => med.care_recipient_id === recipientId && med.active);
    },
    enabled: !!recipientId
  });

  const { data: careNotes = [] } = useQuery({
    queryKey: ['careNotes', recipientId],
    queryFn: async () => {
      const all = await base44.entities.CareNote.list('-created_date', 50);
      return all.filter(note => note.care_recipient_id === recipientId);
    },
    enabled: !!recipientId
  });

  if (!recipient) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-slate-500">Loading recipient profile...</p>
        </div>
      </div>
    );
  }

  if (showEditForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <CareRecipientForm recipient={recipient} onClose={() => setShowEditForm(false)} />
      </div>
    );
  }

  const age = recipient.date_of_birth 
    ? differenceInYears(new Date(), parseISO(recipient.date_of_birth))
    : null;

  const conditions = (() => {
    try {
      return recipient.conditions_diagnoses ? JSON.parse(recipient.conditions_diagnoses) : [];
    } catch {
      return [];
    }
  })();

  const medicalHistory = (() => {
    try {
      return recipient.medical_history ? JSON.parse(recipient.medical_history) : [];
    } catch {
      return [];
    }
  })();

  // Filter upcoming appointments
  const today = new Date();
  const upcomingAppointments = appointments
    .filter(apt => isAfter(parseISO(apt.date), today) || apt.date === format(today, 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          {recipient.photo_url ? (
            <img src={recipient.photo_url} alt={recipient.full_name} className="w-24 h-24 rounded-2xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{recipient.full_name}</h1>
            {age && (
              <p className="text-slate-500 mt-1">{age} years old</p>
            )}
            {recipient.date_of_birth && (
              <p className="text-sm text-slate-500">
                Born: {format(parseISO(recipient.date_of_birth), 'MMMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setShowEditForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="notes">Care Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Condition */}
        {recipient.primary_condition && (
          <Card className="lg:col-span-3 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-blue-600" />
                Primary Condition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-800 font-medium">{recipient.primary_condition}</p>
            </CardContent>
          </Card>
        )}

        {/* Conditions & Diagnoses */}
        {conditions.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Conditions & Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-800">{cond.condition}</span>
                    {cond.diagnosed_date && (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(parseISO(cond.diagnosed_date), 'MMM yyyy')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Allergies & Dietary */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Allergies & Diet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {recipient.allergies && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Allergies</p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{recipient.allergies}</p>
                </div>
              </div>
            )}
            {recipient.dietary_restrictions && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  Dietary Restrictions
                </p>
                <p className="text-sm text-slate-600">{recipient.dietary_restrictions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical History */}
        {medicalHistory.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {medicalHistory.map((hist, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{hist.event}</h4>
                      {hist.date && (
                        <Badge variant="outline">
                          {format(parseISO(hist.date), 'MMM yyyy')}
                        </Badge>
                      )}
                    </div>
                    {hist.notes && (
                      <p className="text-sm text-slate-600">{hist.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-600" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {recipient.emergency_contact_name && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-600 font-semibold uppercase mb-2">Primary Contact</p>
                <p className="font-semibold text-slate-800">{recipient.emergency_contact_name}</p>
                {recipient.emergency_contact_relationship && (
                  <p className="text-sm text-slate-600">{recipient.emergency_contact_relationship}</p>
                )}
                {recipient.emergency_contact_phone && (
                  <p className="text-sm text-slate-700 mt-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {recipient.emergency_contact_phone}
                  </p>
                )}
                {recipient.emergency_contact_email && (
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {recipient.emergency_contact_email}
                  </p>
                )}
              </div>
            )}
            {recipient.secondary_emergency_contact_name && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold uppercase mb-2">Secondary Contact</p>
                <p className="font-semibold text-slate-800">{recipient.secondary_emergency_contact_name}</p>
                {recipient.secondary_emergency_contact_phone && (
                  <p className="text-sm text-slate-700 mt-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {recipient.secondary_emergency_contact_phone}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Physician Info */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Primary Physician
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recipient.primary_physician ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-800">{recipient.primary_physician}</p>
                {recipient.physician_phone && (
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {recipient.physician_phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No physician information</p>
            )}
          </CardContent>
        </Card>

            {/* Additional Notes */}
            {recipient.notes && (
              <Card className="lg:col-span-3">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-lg">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 whitespace-pre-wrap">{recipient.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map(apt => (
                    <div key={apt.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{apt.title}</h4>
                          <p className="text-sm text-slate-600 capitalize">{apt.appointment_type?.replace('_', ' ')}</p>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(apt.date), 'MMMM d, yyyy')}
                          {apt.time && ` at ${apt.time}`}
                        </p>
                        {apt.location && (
                          <p className="text-slate-600">{apt.location}</p>
                        )}
                        {apt.provider_name && (
                          <p className="text-slate-600">Provider: {apt.provider_name}</p>
                        )}
                      </div>
                      {apt.notes && (
                        <p className="mt-2 text-sm text-slate-600 bg-white p-2 rounded">{apt.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-green-600" />
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No active medications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map(med => (
                    <div key={med.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-800">{med.medication_name}</h4>
                          <p className="text-sm text-slate-600">{med.dosage}</p>
                        </div>
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        {med.frequency && (
                          <p className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {med.frequency} {med.time_of_day && `- ${med.time_of_day}`}
                          </p>
                        )}
                        {med.purpose && (
                          <p className="text-slate-600">Purpose: {med.purpose}</p>
                        )}
                        {med.prescribing_doctor && (
                          <p className="text-slate-600">Prescribed by: {med.prescribing_doctor}</p>
                        )}
                        {med.refill_date && (
                          <p className="text-slate-600">Next refill: {format(parseISO(med.refill_date), 'MMM d, yyyy')}</p>
                        )}
                        {med.special_instructions && (
                          <p className="mt-2 text-sm text-slate-700 bg-white p-2 rounded border border-green-300">
                            <strong>Instructions:</strong> {med.special_instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-purple-600" />
                Recent Care Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {careNotes.length === 0 ? (
                <div className="text-center py-8">
                  <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No care notes yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {careNotes.map(note => (
                    <div key={note.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {note.title && (
                            <h4 className="font-semibold text-slate-800">{note.title}</h4>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">
                              {note.note_type?.replace('_', ' ')}
                            </Badge>
                            {note.mood && (
                              <Badge className={
                                note.mood === 'great' ? 'bg-green-100 text-green-800' :
                                note.mood === 'good' ? 'bg-blue-100 text-blue-800' :
                                note.mood === 'okay' ? 'bg-yellow-100 text-yellow-800' :
                                note.mood === 'difficult' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {note.mood}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {note.flagged_important && (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{note.content}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{format(parseISO(note.date), 'MMM d, yyyy')}</span>
                        {note.time && <span>{note.time}</span>}
                        {note.created_by && <span>By: {note.created_by}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}