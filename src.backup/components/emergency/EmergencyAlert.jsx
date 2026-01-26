import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmergencyAlert({ recipientId, recipientName }) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list()
  });

  const recipientTeamMembers = teamMembers.filter(
    tm => tm.care_recipient_id === recipientId && tm.active
  );

  const sendAlertMutation = useMutation({
    mutationFn: async ({ conversationId, messageData }) => {
      await base44.entities.Message.create(messageData);
      await base44.entities.Conversation.update(conversationId, {
        last_message_at: new Date().toISOString()
      });
      
      // Create notifications for selected members
      const notificationPromises = selectedMembers.map(email => 
        base44.entities.Notification.create({
          user_email: email,
          type: 'general',
          title: '🚨 Emergency Alert',
          message: `Emergency alert for ${recipientName}`,
          priority: 'urgent'
        })
      );
      await Promise.all(notificationPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      queryClient.invalidateQueries(['conversations']);
      queryClient.invalidateQueries(['notifications']);
      setMessage('');
      setSelectedMembers([]);
      toast.success('Emergency alert sent to all selected team members');
    },
    onError: () => {
      toast.error('Failed to send alert');
    }
  });

  const handleSendAlert = async () => {
    if (!message.trim() || selectedMembers.length === 0 || !user) {
      toast.error('Please write a message and select at least one team member');
      return;
    }

    // Find or create an emergency conversation
    let emergencyConv = conversations.find(
      c => c.care_recipient_id === recipientId && c.conversation_type === 'care_team'
    );

    if (!emergencyConv) {
      // Create emergency conversation
      emergencyConv = await base44.entities.Conversation.create({
        name: `${recipientName} - Emergency Alerts`,
        care_recipient_id: recipientId,
        conversation_type: 'care_team',
        participants: JSON.stringify(selectedMembers),
        last_message_at: new Date().toISOString()
      });
      queryClient.invalidateQueries(['conversations']);
    }

    const alertMessage = `🚨 EMERGENCY ALERT 🚨\n\n${message}`;

    sendAlertMutation.mutate({
      conversationId: emergencyConv.id,
      messageData: {
        conversation_id: emergencyConv.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content: alertMessage,
        message_type: 'text'
      }
    });
  };

  const toggleMember = (email) => {
    if (selectedMembers.includes(email)) {
      setSelectedMembers(selectedMembers.filter(e => e !== email));
    } else {
      setSelectedMembers([...selectedMembers, email]);
    }
  };

  const selectAll = () => {
    if (selectedMembers.length === recipientTeamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(recipientTeamMembers.map(tm => tm.user_email));
    }
  };

  return (
    <Card className="shadow-sm border-red-200 bg-red-50/50">
      <CardHeader className="bg-red-100 border-b border-red-200">
        <CardTitle className="flex items-center gap-2 text-red-900">
          <AlertCircle className="w-5 h-5" />
          Send Emergency Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Alert Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the emergency situation..."
            rows={4}
            className="bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">
              Select Team Members to Alert
            </label>
            {recipientTeamMembers.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="text-blue-600 hover:text-blue-700"
              >
                {selectedMembers.length === recipientTeamMembers.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
          
          {recipientTeamMembers.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              No team members found for this care recipient
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200">
              {recipientTeamMembers.map(member => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.user_email)}
                    onCheckedChange={() => toggleMember(member.user_email)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-800">{member.full_name}</div>
                    <div className="text-xs text-slate-500">{member.relationship}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleSendAlert}
          disabled={sendAlertMutation.isPending || !message.trim() || selectedMembers.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {sendAlertMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Alert...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Emergency Alert to {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        <p className="text-xs text-slate-600 text-center">
          Alert will be sent as a message and urgent notification to all selected team members
        </p>
      </CardContent>
    </Card>
  );
}