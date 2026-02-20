import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Users, Shield, UserCheck, Eye, Edit2, Trash2 } from 'lucide-react';

const ROLE_CONFIG = {
  admin: {
    icon: Shield,
    badge: 'bg-[#F4A261]/15 text-[#E07A5F] border-[#F4A261]/30',
    avatar: 'bg-gradient-to-br from-[#F4A261] to-[#E07A5F]',
  },
  caregiver: {
    icon: UserCheck,
    badge: 'bg-[#4F46E5]/10 text-[#4F46E5] border-[#4F46E5]/20',
    avatar: 'bg-gradient-to-br from-[#4F46E5] to-[#8B7EC8]',
  },
  viewer: {
    icon: Eye,
    badge: 'bg-[#8B7EC8]/10 text-[#8B7EC8] border-[#8B7EC8]/20',
    avatar: 'bg-gradient-to-br from-[#8B7EC8] to-[#4F46E5]/60',
  },
};

export function TeamMemberCard({ member, getRecipientName, onEdit, onDelete }) {
  const config = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer;
  const RoleIcon = config.icon;

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-sm border border-[#4F46E5]/10 hover:shadow-md hover:border-[#4F46E5]/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full ${config.avatar} flex items-center justify-center`}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#4F46E5]">{member.full_name}</h3>
              {member.relationship && (
                <p className="text-sm text-[#8B7EC8]">{member.relationship}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <Badge className={`${config.badge} border`}>
            {(member.role || 'member').toUpperCase()}
          </Badge>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-[#8B7EC8]">
              <Mail className="w-4 h-4 text-[#E07A5F]/60" />
              <span className="truncate">{member.email}</span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-2 text-[#8B7EC8]">
                <Phone className="w-4 h-4 text-[#E07A5F]/60" />
                {member.phone}
              </div>
            )}
            <div className="flex items-start gap-2 text-[#8B7EC8]">
              <Users className="w-4 h-4 text-[#4F46E5]/50 mt-0.5" />
              <span>Caring for: {
                Array.isArray(member.care_recipient_ids) && member.care_recipient_ids.length > 0
                  ? member.care_recipient_ids.map(id => getRecipientName(id)).join(', ')
                  : 'Not assigned'
              }</span>
            </div>
          </div>

          {member.specialties && (
            <div className="pt-3 border-t border-[#4F46E5]/10">
              <p className="text-xs text-[#8B7EC8]/70 mb-1">Responsibilities:</p>
              <p className="text-sm text-[#4F46E5]/80">{member.specialties}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-[#4F46E5]/10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(member)}
            className="flex-1 border-[#4F46E5]/20 text-[#4F46E5] hover:bg-[#4F46E5]/5"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(member)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
