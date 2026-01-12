import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Share2 } from 'lucide-react';

export default function MessageInput({ onSend, onShareUpdate, disabled }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 p-4 bg-white">
      <div className="flex gap-2">
        <Textarea
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="resize-none"
          rows={2}
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
          <Button
            onClick={onShareUpdate}
            disabled={disabled}
            variant="outline"
            size="icon"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}