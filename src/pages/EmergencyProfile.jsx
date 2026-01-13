import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Phone, FileText, Pill, User, MapPin, Heart, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function EmergencyProfile() {
  const [selectedRecipient, setSelectedRecipient] = useState('');

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const recipient = recipients.find(r => r.id === selectedRecipient);
  const recipientMeds = medications.filter(m => m.care_recipient_id === selectedRecipient && m.active);
  const recipientDocs = documents.filter(d => d.care_recipient_id === selectedRecipient);

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Emergency Profile - ${recipient?.full_name}`,
      text: `Emergency contact and medical information for ${recipient?.full_name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              Emergency Profile
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">Quick access to critical care information</p>
          </div>
          {recipient && (
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6 bg-red-50 border-red-200 shadow-sm print:hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Emergency Use Only</h3>
                <p className="text-sm text-red-800">
                  This profile contains critical medical information for emergency responders and medical professionals.
                  Always call 911 in case of emergency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 print:hidden">
          <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select care recipient" />
            </SelectTrigger>
            <SelectContent>
              {recipients.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!recipient ? (
          <Card className="shadow-sm border-slate-200/60">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select a care recipient to view their emergency profile</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Full Name</div>
                    <div className="font-semibold text-lg">{recipient.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Date of Birth</div>
                    <div className="font-semibold">{recipient.date_of_birth || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Primary Condition</div>
                    <div className="font-semibold">{recipient.primary_condition || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Allergies</div>
                    <Badge className="bg-red-100 text-red-700">
                      {recipient.allergies || 'None known'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-800">
                        {recipient.emergency_contact_name || 'Not provided'}
                      </div>
                      <Badge className="bg-green-100 text-green-700">Primary</Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>Relationship: {recipient.emergency_contact_relationship || 'Not specified'}</div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${recipient.emergency_contact_phone}`} className="font-medium text-blue-600">
                          {recipient.emergency_contact_phone || 'Not provided'}
                        </a>
                      </div>
                      {recipient.emergency_contact_email && (
                        <div className="text-slate-500">{recipient.emergency_contact_email}</div>
                      )}
                    </div>
                  </div>
                  
                  {recipient.secondary_emergency_contact_name && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-800">
                          {recipient.secondary_emergency_contact_name}
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">Secondary</Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${recipient.secondary_emergency_contact_phone}`} className="font-medium text-blue-600">
                            {recipient.secondary_emergency_contact_phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Medications */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-600" />
                  Current Medications ({recipientMeds.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recipientMeds.length === 0 ? (
                  <p className="text-slate-500 text-sm">No active medications</p>
                ) : (
                  <div className="space-y-3">
                    {recipientMeds.map(med => (
                      <div key={med.id} className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-semibold text-slate-800">{med.medication_name}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          <div>Dosage: {med.dosage}</div>
                          <div>Frequency: {med.frequency}</div>
                          {med.purpose && <div>Purpose: {med.purpose}</div>}
                          {med.special_instructions && (
                            <div className="text-orange-700 font-medium mt-1">⚠️ {med.special_instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Primary Physician */}
            {recipient.primary_physician && (
              <Card className="shadow-sm border-slate-200/60">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Primary Physician
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="font-semibold text-slate-800">{recipient.primary_physician}</div>
                  {recipient.physician_phone && (
                    <div className="flex items-center gap-2 mt-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${recipient.physician_phone}`} className="font-medium text-blue-600">
                        {recipient.physician_phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Important Documents */}
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="bg-slate-50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Important Documents ({recipientDocs.filter(d => d.is_important).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recipientDocs.filter(d => d.is_important).length === 0 ? (
                  <p className="text-slate-500 text-sm">No important documents marked</p>
                ) : (
                  <div className="space-y-2">
                    {recipientDocs.filter(d => d.is_important).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">{doc.document_name}</span>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700">{doc.document_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {recipient.notes && (
              <Card className="shadow-sm border-slate-200/60">
                <CardHeader className="bg-slate-50">
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 whitespace-pre-wrap">{recipient.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}