import React, { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth-context';
import { MessageSquare } from 'lucide-react';

function MessageBubble({ message, isOwn }) {
  const senderName = message.profiles?.full_name || 'Care Team';
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-teal-600 text-white'
            : 'bg-white border border-slate-200 text-slate-800'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-teal-700 mb-1">
            {senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? 'text-teal-100' : 'text-slate-400'
          }`}
        >
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export function ClientMessageThread({ messages = [], isLoading }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-slate-500">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-12 h-12 text-teal-200 mb-4" />
        <p className="text-slate-500">No messages yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Send a message to your care team below
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={msg.sender_id === user?.id}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
