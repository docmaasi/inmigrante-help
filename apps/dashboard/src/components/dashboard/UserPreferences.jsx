import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User, Clock } from 'lucide-react';

export default function UserPreferences({ profile, updateProfile, timeFormat, onTimeFormatChange }) {
  const [nameInput, setNameInput] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ full_name: trimmed });
      toast.success('Name updated!');
    } catch {
      toast.error('Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 mb-4">
      {/* Display Name */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-teal-600" />
          <span className="font-medium text-slate-800 text-sm">Your Profile</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder="Enter your display name"
            className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
          <Button
            size="sm"
            onClick={handleSaveName}
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Time Format */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span className="font-medium text-slate-800 text-sm">Time Format</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={timeFormat === '12h' ? 'default' : 'outline'}
            onClick={() => onTimeFormatChange('12h')}
            className={timeFormat === '12h' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
          >
            12h (2:30 PM)
          </Button>
          <Button
            size="sm"
            variant={timeFormat === '24h' ? 'default' : 'outline'}
            onClick={() => onTimeFormatChange('24h')}
            className={timeFormat === '24h' ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}
          >
            24h (14:30)
          </Button>
        </div>
      </div>
    </div>
  );
}
