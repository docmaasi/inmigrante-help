import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientAppointments() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [recipientId, setRecipientId] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const fetchClientAccess = async () => {
      const { data: accesses, error } = await supabase
        .from('client_access')
        .select('care_recipient_id')
        .eq('is_active', true)
        .limit(1);

      if (error || !accesses || accesses.length === 0) {
        navigate('/');
        return;
      }

      setRecipientId(accesses[0].care_recipient_id);
    };

    fetchClientAccess();
  }, [user, isAuthLoading, navigate]);

  const { data: recipient } = useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['clientAppointments', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('care_recipient_id', recipientId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const statusColors = {
    scheduled: 'bg-teal-100 text-teal-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-800'
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return '';
    }
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const recipientFullName = `${recipient.first_name} ${recipient.last_name}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientPortalNav careRecipientName={recipientFullName} currentPageName="ClientAppointments" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Appointments</h1>
          <p className="text-slate-600">View all scheduled appointments and medical visits</p>
        </div>

        {appointments.length === 0 ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="w-12 h-12 text-teal-200 mx-auto mb-4" />
              <p className="text-slate-500">No appointments scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map(apt => (
              <Card key={apt.id} className="border border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                          <Calendar className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800">{apt.title}</h3>
                          <div className="space-y-2 mt-3 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(apt.start_time)} at {formatTime(apt.start_time)}
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
