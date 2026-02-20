import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export function TeamMemberForm({
  open,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEditing,
  isPending,
  recipients,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#4F46E5]">
            {isEditing ? 'Edit Team Member' : 'Add Team Member'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full Access</SelectItem>
                  <SelectItem value="caregiver">Caregiver - Can Edit</SelectItem>
                  <SelectItem value="viewer">Viewer - Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Care Recipient(s) *</Label>
              <div className="mt-2 space-y-2 border border-[#8B7EC8]/20 rounded-lg p-3 max-h-40 overflow-y-auto">
                {recipients.length === 0 ? (
                  <p className="text-sm text-[#8B7EC8]">No care recipients added yet</p>
                ) : (
                  recipients.map(recipient => (
                    <label key={recipient.id} className="flex items-center gap-2 cursor-pointer hover:bg-[#4F46E5]/5 rounded p-1">
                      <Checkbox
                        checked={formData.care_recipient_ids.includes(recipient.id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            care_recipient_ids: checked
                              ? [...prev.care_recipient_ids, recipient.id]
                              : prev.care_recipient_ids.filter(id => id !== recipient.id)
                          }));
                        }}
                      />
                      <span className="text-sm text-[#4F46E5]/80">
                        {recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {formData.care_recipient_ids.length > 0 && (
                <p className="text-xs text-[#8B7EC8] mt-1">{formData.care_recipient_ids.length} selected</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                placeholder="e.g., Daughter, Professional Caregiver"
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialties">Responsibilities / Specialties</Label>
            <Textarea
              id="specialties"
              placeholder="e.g., Medication management, meal prep, transportation"
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-[#E07A5F] to-[#F4A261] hover:from-[#E07A5F]/90 hover:to-[#F4A261]/90 text-white"
            >
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
