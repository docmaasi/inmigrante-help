import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Mail, Phone, Shield, UserCheck, Eye, Edit2, Trash2, UserX } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

export default function Team() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    user_email: '',
    care_recipient_id: '',
    role: 'caregiver',
    full_name: '',
    relationship: '',
    phone: '',
    specialties: ''
  });

  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list('-created_date')
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions['add-team-member-with-limit-check']({ memberData: data });
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['teamMembers']);
      const message = data.remainingSlots > 0 
        ? `Team member added! You have ${data.remainingSlots} slot${data.remainingSlots > 1 ? 's' : ''} remaining.`
        : 'Team member added! You have reached your member limit.';
      toast.success(message);
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      toast.success('Team member updated');
      handleCloseDialog();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      toast.success('Team member removed');
    }
  });

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingMember(null);
    setFormData({
      user_email: '',
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
      user_email: member.user_email,
      care_recipient_id: member.care_recipient_id,
      role: member.role,
      full_name: member.full_name,
      relationship: member.relationship || '',
      phone: member.phone || '',
      specialties: member.specialties || ''
    });
    setShowAddDialog(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getRecipientName = (id) => {
    return recipients.find(r => r.id === id)?.full_name || 'Unknown';
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
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'caregiver': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const activeMembers = teamMembers.filter(m => m.active !== false);
  
  // Calculate if limit is reached
  const maxMembers = currentUser?.subscription_additional_members !== undefined 
    ? 1 + (currentUser.subscription_additional_members || 0)
    : 1;
  const isLimitReached = activeMembers.length >= maxMembers;

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/59e1069c0_Untitleddesign17.png)'
        }}
      />
      <div className="max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Care Team</h1>
          <p className="text-sm md:text-base text-slate-700 mt-1">Manage caregivers, family members, and their roles</p>
          {currentUser && currentUser.subscription_additional_members !== undefined && (
            <p className={`text-xs mt-1 ${isLimitReached ? 'text-orange-600 font-semibold' : 'text-blue-600'}`}>
              {activeMembers.length} / {maxMembers} members used {isLimitReached && '(Limit reached)'}
            </p>
          )}
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          disabled={isLimitReached}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isLimitReached ? 'Member Limit Reached' : 'Add Team Member'}
        </Button>
        {isLimitReached && (
          <p className="text-sm text-orange-600 mt-2">
            Upgrade your subscription to add more team members
          </p>
        )}
      </div>

      {/* Role Legend */}
      <Card className="mb-6 shadow-sm border-slate-200/60">
        <CardContent className="p-4 md:p-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">Permission Levels:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">Admin - Full access to all features</span>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">Caregiver - Can create and edit records</span>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-600">Viewer - Read-only access</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm border-slate-200/60">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
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
        <Card className="border-slate-200/60">
          <CardContent className="p-8 md:p-12 text-center">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">No Team Members</h3>
            <p className="text-sm md:text-base text-slate-500 mb-6">Add team members to coordinate care</p>
            <Button 
              onClick={() => setShowAddDialog(true)} 
              disabled={isLimitReached}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLimitReached ? 'Member Limit Reached' : 'Add Team Member'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMembers.map(member => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <Card key={member.id} className="shadow-sm border-slate-200/60 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                        <RoleIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{member.full_name}</h3>
                        {member.relationship && (
                          <p className="text-sm text-slate-500">{member.relationship}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <Badge className={`${getRoleColor(member.role)} border`}>
                      {member.role.toUpperCase()}
                    </Badge>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{member.user_email}</span>
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
                      onClick={() => {
                        if (confirm(`Remove ${member.full_name} from the care team?`)) {
                          deleteMutation.mutate(member.id);
                        }
                      }}
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
                <Label htmlFor="user_email">Email *</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData({...formData, user_email: e.target.value})}
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
                    {recipients.map(recipient => (
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
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingMember ? 'Update' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}