import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CareRecipientForm({ recipient, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(recipient || {
    full_name: '',
    date_of_birth: '',
    photo_url: '',
    primary_condition: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    primary_physician: '',
    physician_phone: '',
    notes: ''
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (recipient?.id) {
        return base44.entities.CareRecipient.update(recipient.id, data);
      }
      return base44.entities.CareRecipient.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['careRecipients']);
      toast.success(recipient ? 'Care recipient updated' : 'Care recipient added');
      onClose();
    }
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo_url: file_url });
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name) {
      toast.error('Please enter a name');
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <Card className="shadow-lg border-slate-200/60">
      <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">
          {recipient ? 'Edit Care Recipient' : 'Add Care Recipient'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            {formData.photo_url ? (
              <img src={formData.photo_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div>
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </>
                  )}
                </div>
              </Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_condition">Primary Condition</Label>
                <Input
                  id="primary_condition"
                  value={formData.primary_condition}
                  onChange={(e) => setFormData({ ...formData, primary_condition: e.target.value })}
                  placeholder="e.g., Alzheimer's, Diabetes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List any allergies"
                />
              </div>
            </div>
          </div>

          {/* Physician Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Primary Physician</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_physician">Doctor Name</Label>
                <Input
                  id="primary_physician"
                  value={formData.primary_physician}
                  onChange={(e) => setFormData({ ...formData, primary_physician: e.target.value })}
                  placeholder="Dr. Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physician_phone">Doctor Phone</Label>
                <Input
                  id="physician_phone"
                  value={formData.physician_phone}
                  onChange={(e) => setFormData({ ...formData, physician_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other important information..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : recipient ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}