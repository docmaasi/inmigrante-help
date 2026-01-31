import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Mail, Phone, Shield, UserCheck, Eye, Edit2, Trash2 } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { errorHandlers } from "@/lib/error-handler";
import {
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useCareRecipients,
} from '@/hooks';

export default function Team() {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    care_recipient_id: '',
    role: 'caregiver',
    full_name: '',
    relationship: '',
    phone: '',
    specialties: ''
  });

  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const { data: recipients = [] } = useCareRecipients();

  const inviteMutation = useInviteTeamMember();
  const updateMutation = useUpdateTeamMember();
  const removeMutation = useRemoveTeamMember();

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingMember(null);
    setFormData({
      email: '',
      care_recipient_id: '',
      role: 'caregiver',
      full_name: '',
      relationship: '',
      phone: '',
      specialties: ''
    });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      email: member.email || '',
      care_recipient_id: member.care_recipient_id || '',
      role: member.role || 'caregiver',
      full_name: member.full_name || '',
      relationship: member.relationship || '',
      phone: member.phone || '',
      specialties: member.specialties || ''
    });
    setShowAddDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMember) {
      updateMutation.mutate(
        {
          id: editingMember.id,
          email: formData.email,
          care_recipient_id: formData.care_recipient_id,
          role: formData.role,
          full_name: formData.full_name,
          relationship: formData.relationship,
          phone: formData.phone,
          specialties: formData.specialties,
        },
        {
          onSuccess: () => {
            toast.success('Team member updated');
            handleCloseDialog();
          },
          onError: (error) => {
            errorHandlers.save('team member', error);
          },
        }
      );
    } else {
      inviteMutation.mutate(
        {
          email: formData.email,
          care_recipient_id: formData.care_recipient_id,
          role: formData.role,
          full_name: formData.full_name,
          relationship: formData.relationship,
          phone: formData.phone,
          specialties: formData.specialties,
        },
        {
          onSuccess: () => {
            toast.success('Team member added successfully!');
            handleCloseDialog();
          },
          onError: (error) => {
            errorHandlers.save('team member', error);
          },
        }
      );
    }
  };

  const handleDelete = (member) => {
    if (confirm(`Remove ${member.full_name} from the care team?`)) {
      removeMutation.mutate(member.id, {
        onSuccess: () => {
          toast.success('Team member removed');
        },
      });
    }
  };

  // Transform recipients to match expected format
  const formattedRecipients = recipients.map(r => ({
    ...r,
    full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  const getRecipientName = (id) => {
    return formattedRecipients.find(r => r.id === id)?.full_name || 'Unknown';
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return Shield;
      case 'caregiver': return UserCheck;
      case 'viewer': return Eye;
      default: return Users;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'caregiver': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'viewer': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const activeMembers = teamMembers.filter(m => m.status !== 'removed');

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Care Team</h1>
          <p className="text-sm md:text-base text-slate-700 mt-1">Manage caregivers, family members, and their roles</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Role Legend */}
      <Card className="mb-6 bg-white shadow-sm border border-slate-200">
        <CardContent className="p-4 md:p-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Permission Levels:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">Admin - Full access to all features</span>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">Caregiver - Can create and edit records</span>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">Viewer - Read-only access</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white shadow-sm border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-full mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeMembers.length === 0 ? (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No Team Members</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6">Add team members to coordinate care</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMembers.map(member => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <Card key={member.id} className="bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <RoleIcon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{member.full_name}</h3>
                        {member.relationship && (
                          <p className="text-sm text-slate-500">{member.relationship}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <Badge className={`${getRoleColor(member.role)} border`}>
                      {(member.role || 'member').toUpperCase()}
                    </Badge>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {member.phone}
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                        <span>Caring for: {getRecipientName(member.care_recipient_id)}</span>
                      </div>
                    </div>

                    {member.specialties && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Responsibilities:</p>
                        <p className="text-sm text-slate-700">{member.specialties}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(member)}
                      className="flex-1"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(member)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                <Label htmlFor="care_recipient_id">Care Recipient *</Label>
                <Select value={formData.care_recipient_id} onValueChange={(value) => setFormData({...formData, care_recipient_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {formattedRecipients.map(recipient => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending || updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {inviteMutation.isPending || updateMutation.isPending ? 'Saving...' : editingMember ? 'Update' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
