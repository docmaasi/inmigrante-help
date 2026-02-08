import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export function ClientUpdates() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ['clientAccess', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data, error } = await supabase
        .from('client_access')
        .select('*')
        .eq('client_email', user.email)
        .eq('approved', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.email
  });

  const recipientId = access?.care_recipient_id;

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

  const { data: notes = [] } = useQuery({
    queryKey: ['careNotes', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('care_notes')
        .select('*')
        .eq('care_recipient_id', recipientId)
        .eq('flagged_important', true)
        .order('date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  React.useEffect(() => {
    if (!accessLoading && user && !access) {
      navigate('/');
    }
  }, [accessLoading, user, access, navigate]);

  const moodColors = {
    great: 'bg-green-100 text-green-800',
    good: 'bg-teal-100 text-teal-800',
    okay: 'bg-yellow-100 text-yellow-800',
    difficult: 'bg-orange-100 text-orange-800',
    concerning: 'bg-red-100 text-red-800'
  };

  if (authLoading || accessLoading || !recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientPortalNav careRecipientName={recipient.full_name} currentPageName="ClientUpdates" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Care Updates</h1>
          <p className="text-slate-600">Important updates and notes from the care team</p>
        </div>

        {notes.length === 0 ? (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="w-12 h-12 text-teal-200 mx-auto mb-4" />
              <p className="text-slate-500">No updates yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <Card key={note.id} className="border border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">{note.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {note.date} {note.time && `at ${note.time}`} - {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {note.mood && (
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${moodColors[note.mood] || 'bg-slate-100 text-slate-800'}`}>
                          {note.mood}
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="w-3 h-3 text-teal-500" />
                      <span className="capitalize">{note.note_type?.replace(/_/g, ' ')}</span>
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
