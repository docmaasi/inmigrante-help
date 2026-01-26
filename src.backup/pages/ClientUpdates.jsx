import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientUpdates() {
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

  const { data: notes = [] } = useQuery({
    queryKey: ['careNotes', recipientId],
    queryFn: () => recipientId 
      ? base44.entities.CareNote.filter(
          { care_recipient_id: recipientId, flagged_important: true },
          '-date',
          50
        )
      : [],
    enabled: !!recipientId
  });

  const moodColors = {
    great: 'bg-green-100 text-green-800',
    good: 'bg-blue-100 text-blue-800',
    okay: 'bg-yellow-100 text-yellow-800',
    difficult: 'bg-orange-100 text-orange-800',
    concerning: 'bg-red-100 text-red-800'
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
      <ClientPortalNav careRecipientName={recipient.full_name} currentPageName="ClientUpdates" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Care Updates</h1>
          <p className="text-slate-600">Important updates and notes from the care team</p>
        </div>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No updates yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map(note => (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">{note.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {note.date} {note.time && `at ${note.time}`} • {formatDistanceToNow(new Date(note.created_date), { addSuffix: true })}
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
                      <FileText className="w-3 h-3" />
                      <span className="capitalize">{note.note_type.replace(/_/g, ' ')}</span>
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