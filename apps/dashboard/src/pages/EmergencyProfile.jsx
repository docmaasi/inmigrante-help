import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCareRecipients, useMedications } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Phone, FileText, Pill, User, Heart, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import EmergencyAlert from '../components/emergency/EmergencyAlert';

export default function EmergencyProfile() {
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const { user } = useAuth();

  const { data: recipients = [] } = useCareRecipients();
  const { data: allMedications = [] } = useMedications();

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const recipient = recipients.find(r => r.id === selectedRecipient);
  const recipientMeds = allMedications.filter(m => m.care_recipient_id === selectedRecipient && m.is_active);
  const recipientDocs = documents.filter(d => d.care_recipient_id === selectedRecipient);

  const fullName = recipient
    ? [recipient.first_name, recipient.last_name].filter(Boolean).join(' ')
    : '';

  const handlePrint = () => {
    window.print();
    toast.success('Opening print dialog');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Emergency Profile - ${fullName}`,
      text: `Emergency contact and medical information for ${fullName}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
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
              <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          )}
        </div>

        <Card className="mb-6 border-red-200 bg-red-50 shadow-sm print:hidden">
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
              {recipients.map(r => {
                const rFullName = [r.first_name, r.last_name].filter(Boolean).join(' ');
                return (
                  <SelectItem key={r.id} value={r.id}>{rFullName}</SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {!recipient ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select a care recipient to view their emergency profile</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <EmergencyAlert recipientId={recipient.id} recipientName={fullName} />

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Full Name</div>
                    <div className="font-semibold text-lg">{fullName}</div>
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

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-600" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-800">
                        {recipient.emergency_contact_name || 'Not provided'}
                      </div>
                      <Badge className="bg-teal-100 text-teal-700">Primary</Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>Relationship: {recipient.emergency_contact_relationship || 'Not specified'}</div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${recipient.emergency_contact_phone}`} className="font-medium text-teal-600 hover:text-teal-700">
                          {recipient.emergency_contact_phone || 'Not provided'}
                        </a>
                      </div>
                      {recipient.emergency_contact_email && (
                        <div className="text-slate-500">{recipient.emergency_contact_email}</div>
                      )}
                    </div>
                  </div>

                  {recipient.secondary_emergency_contact_name && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-800">
                          {recipient.secondary_emergency_contact_name}
                        </div>
                        <Badge className="bg-slate-100 text-slate-700">Secondary</Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${recipient.secondary_emergency_contact_phone}`} className="font-medium text-teal-600 hover:text-teal-700">
                            {recipient.secondary_emergency_contact_phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  Current Medications ({recipientMeds.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recipientMeds.length === 0 ? (
                  <p className="text-slate-500 text-sm">No active medications</p>
                ) : (
                  <div className="space-y-3">
                    {recipientMeds.map(med => (
                      <div key={med.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-800">{med.name}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          <div>Dosage: {med.dosage}</div>
                          <div>Frequency: {med.frequency}</div>
                          {med.purpose && <div>Purpose: {med.purpose}</div>}
                          {med.instructions && (
                            <div className="text-orange-700 font-medium mt-1">Warning: {med.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {recipient.primary_physician && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-teal-600" />
                    Primary Physician
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="font-semibold text-slate-800">{recipient.primary_physician}</div>
                  {recipient.physician_phone && (
                    <div className="flex items-center gap-2 mt-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${recipient.physician_phone}`} className="font-medium text-teal-600 hover:text-teal-700">
                        {recipient.physician_phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Important Documents ({recipientDocs.filter(d => d.is_important).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recipientDocs.filter(d => d.is_important).length === 0 ? (
                  <p className="text-slate-500 text-sm">No important documents marked</p>
                ) : (
                  <div className="space-y-2">
                    {recipientDocs.filter(d => d.is_important).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700">{doc.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {recipient.notes && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
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
