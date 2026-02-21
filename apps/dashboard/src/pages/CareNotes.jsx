import React, { useState } from 'react';
import { useCareRecipients, useCareNotes, useDeleteCareNote } from '@/hooks';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, User, Clock, Flag, Edit2, Trash2, Smile, Frown, Meh } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import CareNoteForm from '../components/notes/CareNoteForm';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export default function CareNotes() {
  const [selectedNote, setSelectedNote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: notes = [], isLoading } = useCareNotes();
  const { data: recipients = [] } = useCareRecipients();
  const deleteMutation = useDeleteCareNote();

  const getRecipientName = (id) => {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient) return 'Unknown';
    return `${recipient.first_name} ${recipient.last_name}`;
  };

  const filteredNotes = filterType === 'all'
    ? notes
    : notes.filter(note => note.category === filterType);

  const noteTypeColors = {
    daily_log: 'bg-blue-100 text-blue-700',
    observation: 'bg-purple-100 text-purple-700',
    incident: 'bg-red-100 text-red-700',
    medication_change: 'bg-orange-100 text-orange-700',
    behavior: 'bg-green-100 text-green-700',
    mood: 'bg-pink-100 text-pink-700',
    vital_signs: 'bg-cyan-100 text-cyan-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const getMoodIcon = (mood) => {
    switch (mood) {
      case 'great':
      case 'good':
        return <Smile className="w-4 h-4 text-green-600" />;
      case 'okay':
        return <Meh className="w-4 h-4 text-yellow-600" />;
      case 'difficult':
      case 'concerning':
        return <Frown className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Care Notes</h1>
          <p className="text-slate-500 mt-1">Log daily activities and observations</p>
        </div>
        <Button
          onClick={() => {
            setSelectedNote(null);
            setShowForm(true);
          }}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'daily_log', 'observation', 'incident', 'medication_change', 'behavior', 'mood', 'vital_signs'].map(type => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
            className={filterType === type ? 'bg-teal-600 hover:bg-teal-700' : ''}
          >
            {type === 'all' ? 'All' : type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </Button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <CareNoteForm
          note={selectedNote}
          recipients={recipients}
          onClose={() => {
            setShowForm(false);
            setSelectedNote(null);
          }}
        />
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Care Notes</h3>
            <p className="text-slate-500 mb-6">
              {filterType === 'all' ? 'Add your first care note to get started' : `No ${filterType.replace(/_/g, ' ')} notes`}
            </p>
            {filterType === 'all' && (
              <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map(note => (
            <Card key={note.id} className={`border-slate-200 hover:shadow-md transition-shadow ${
              note.is_private ? 'border-l-4 border-l-orange-500' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-teal-600 p-3 rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {note.title && (
                          <h3 className="text-lg font-bold text-slate-800">{note.title}</h3>
                        )}
                        {note.is_private && (
                          <Flag className="w-4 h-4 text-orange-600 fill-orange-600" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4 text-slate-400" />
                          {getRecipientName(note.care_recipient_id)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {format(parseISO(note.created_at), 'MMM d, yyyy')}
                        </span>
                        {note.profiles?.full_name && (
                          <>
                            <span className="text-slate-400">-</span>
                            <span className="text-slate-500">by {note.profiles.full_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {note.mood && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getMoodIcon(note.mood)}
                        {note.mood}
                      </Badge>
                    )}
                    <Badge className={`${noteTypeColors[note.category] || noteTypeColors.other} border-0`}>
                      {(note.category || 'other').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-4 mb-4">
                  {note.content}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedNote(note);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteTarget(note)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Note"
        description="Delete this note? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
