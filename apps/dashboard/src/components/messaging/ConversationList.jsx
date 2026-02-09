import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MessageSquare, Users, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ConversationList({ conversations, selectedId, onSelect, recipients }) {
  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'care_team': return Users;
      case 'family': return Heart;
      default: return MessageSquare;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'care_team': return 'bg-blue-100 text-blue-800';
      case 'family': return 'bg-pink-100 text-pink-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-2">
      {conversations.map(conv => {
        const Icon = getTypeIcon(conv.type);
        const participantCount = conv.participant_ids?.length || 0;

        return (
          <Button
            key={conv.id}
            variant={selectedId === conv.id ? "default" : "outline"}
            className={`w-full justify-start h-auto p-3 ${selectedId === conv.id ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => onSelect(conv.id)}
          >
            <div className="flex items-start gap-3 w-full text-left">
              <div className={`p-2 rounded-lg ${selectedId === conv.id ? 'bg-blue-700' : getTypeColor(conv.type)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{conv.title}</div>
                <div className={`text-xs ${selectedId === conv.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  {getRecipientName(conv.care_recipient_id)}
                </div>
                <div className={`text-xs mt-1 ${selectedId === conv.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  {participantCount} participants
                  {conv.last_message_at && ` • ${formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}`}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}