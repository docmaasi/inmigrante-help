import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ShiftTimeFields({ formData, onChange }) {
  const update = (field, value) => onChange({ ...formData, [field]: value });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date & Time *</Label>
          <Input
            type="datetime-local"
            value={formData.start_time?.slice(0, 16) || ''}
            onChange={(e) => update('start_time', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Shift Type</Label>
          <Select value={formData.shift_type} onValueChange={(v) => update('shift_type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (6am-2pm)</SelectItem>
              <SelectItem value="afternoon">Afternoon (2pm-10pm)</SelectItem>
              <SelectItem value="evening">Evening (4pm-midnight)</SelectItem>
              <SelectItem value="night">Night (10pm-6am)</SelectItem>
              <SelectItem value="full_day">Full Day</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>End Date & Time *</Label>
          <Input
            type="datetime-local"
            value={formData.end_time?.slice(0, 16) || ''}
            onChange={(e) => update('end_time', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          placeholder="Any special instructions..."
          value={formData.notes || ''}
          onChange={(e) => update('notes', e.target.value)}
        />
      </div>
    </>
  );
}
