import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientAppointments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipientId, setRecipientId] = useState(null);
  const [recipient, setRecipient] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => navigate(createPageUrl('Dashboard')));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    base44.entities.ClientAccess.filter({
      client_email: user.email,
      approved: true
    }).then(accesses => {
      if (accesses.length === 0) {
        navigate(createPageUrl('Dashboard'));
      } else {
        setRecipientId(accesses[0].care_recipient_id);
      }
    });
  }, [user, navigate]);

  const { data: recipientData } = useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: () => recipientId ? base44.entities.CareRecipient.filter({ id: recipientId }).then(data => data[0]) : null,
    enabled: !!recipientId
  });

  useEffect(() => {
    if (recipientData) setRecipient(recipientData);
  }, [recipientData]);

  const { data: appointments = [] } = useQuery({
    queryKey: ['clientAppointments', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.Appointment.filter({ care_recipient_id: recipientId }, '-date')
      : [],
    enabled: !!recipientId
  });

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-800'
  };

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ClientPortalNav careRecipientName={recipient.full_name} currentPageName="ClientAppointments" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Appointments</h1>
          <p className="text-slate-600">View all scheduled appointments and medical visits</p>
        </div>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No appointments scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => (
              <Card key={apt.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800">{apt.title}</h3>
                          <div className="space-y-2 mt-3 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(apt.date), 'EEEE, MMMM d, yyyy')} at {apt.time}
                            </p>
                            {apt.location && (
                              <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {apt.location}
                              </p>
                            )}
                            {apt.provider_name && (
                              <p className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Provider: {apt.provider_name}
                              </p>
                            )}
                          </div>
                          {apt.notes && (
                            <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 text-sm">
                              <p className="font-medium text-slate-700 mb-1">Notes:</p>
                              <p className="text-slate-600">{apt.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[apt.status] || 'bg-slate-100 text-slate-800'}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}