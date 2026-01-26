import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Pill, CheckSquare, FileText } from 'lucide-react';

export default function ShareUpdateDialog({ open, onClose, onShare, appointments, medications, tasks }) {
  const [updateType, setUpdateType] = useState('general');
  const [relatedEntity, setRelatedEntity] = useState('');
  const [content, setContent] = useState('');

  const handleShare = () => {
    onShare({
      type: updateType,
      relatedEntityId: relatedEntity || null,
      content: content.trim()
    });
    setUpdateType('general');
    setRelatedEntity('');
    setContent('');
  };

  const getEntityOptions = () => {
    switch(updateType) {
      case 'appointment':
        return appointments.map(a => ({ id: a.id, label: a.title }));
      case 'medication':
        return medications.map(m => ({ id: m.id, label: m.medication_name }));
      case 'task':
        return tasks.map(t => ({ id: t.id, label: t.title }));
      default:
        return [];
    }
  };

  const entityOptions = getEntityOptions();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Update</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Update Type</Label>
            <Select value={updateType} onValueChange={setUpdateType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    General Update
                  </div>
                </SelectItem>
                <SelectItem value="appointment">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Appointment Outcome
                  </div>
                </SelectItem>
                <SelectItem value="medication">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Medication Adherence
                  </div>
                </SelectItem>
                <SelectItem value="task">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Task Update
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {updateType !== 'general' && entityOptions.length > 0 && (
            <div>
              <Label>Related Item</Label>
              <Select value={relatedEntity} onValueChange={setRelatedEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Update Message</Label>
            <Textarea
              placeholder="Share details about this update..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={!content.trim()}>
              Share Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}