import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Heart, FileText, AlertCircle, Utensils, Phone, Mail, Edit } from 'lucide-react';
import { format, parseISO, differenceInYears } from 'date-fns';
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
    </div>
  );
}