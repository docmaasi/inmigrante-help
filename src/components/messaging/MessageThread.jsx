import React, { useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Calendar, Pill, CheckSquare, AlertCircle,
  Check, Loader2, RotateCcw, XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

function MessageStatus({ status, onRetry }) {
  if (status === 'sending') {
    return <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />;
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1">
        <XCircle className="w-3 h-3 text-red-500" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-5 px-1 text-xs text-red-600 hover:text-red-700"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }
  return <Check className="w-3 h-3 text-slate-400" />;
}

export default function MessageThread({
  messages,
  currentUserEmail,
  onRetry,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageIcon = (type) => {
    switch(type) {
      case 'appointment': return Calendar;
      case 'medication': return Pill;
      case 'task': return CheckSquare;
      case 'update': return AlertCircle;
      default: return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwn = message.sender_email === currentUserEmail;
          const Icon = getMessageIcon(message.message_type);
          const isFailed = message.status === 'failed';

          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isOwn && (
                  <div className="text-xs font-medium text-slate-600 mb-1">
                    {message.sender_name || message.sender_email}
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2 ${
                  isFailed
                    ? 'bg-red-50 border border-red-200'
                    : isOwn
                    ? 'bg-blue-600 text-white'
                    : message.message_type !== 'text'
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {Icon && (
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${isOwn ? 'text-blue-100' : 'text-orange-600'}`} />
                      <Badge variant="outline" className={isOwn ? 'border-blue-400 text-blue-100' : 'border-orange-300 text-orange-700'}>
                        {message.message_type}
                      </Badge>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                  <span className={`text-xs ${isOwn ? 'text-slate-500' : 'text-slate-400'}`}>
                    {format(new Date(message.created_date), 'h:mm a')}
                  </span>
                  {isOwn && (
                    <MessageStatus
                      status={message.status}
                      onRetry={() => onRetry?.(message)}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
