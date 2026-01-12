import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import ShareUpdateDialog from '../components/messaging/ShareUpdateDialog';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newConvData, setNewConvData] = useState({
    name: '',
    care_recipient_id: '',
    conversation_type: 'general',
    participants: []
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-last_message_at')
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: selectedConversationId }, 'created_date'),
    enabled: !!selectedConversationId
  });

  const { data: recipients = [] } = useQuery({
    queryKey: ['careRecipients'],
    queryFn: () => base44.entities.CareRecipient.list()
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date', 20)
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  // Real-time message subscription
  useEffect(() => {
    if (!selectedConversationId) return;

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data.conversation_id === selectedConversationId) {
        queryClient.invalidateQueries(['messages', selectedConversationId]);
        queryClient.invalidateQueries(['conversations']);
      }
    });

    return unsubscribe;
  }, [selectedConversationId, queryClient]);

  const createConversationMutation = useMutation({
    mutationFn: (data) => base44.entities.Conversation.create(data),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries(['conversations']);
      setSelectedConversationId(newConv.id);
      setShowNewConvDialog(false);
      toast.success('Conversation created');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedConversationId]);
      base44.entities.Conversation.update(selectedConversationId, {
        last_message_at: new Date().toISOString()
      });
    }
  });

  const handleCreateConversation = () => {
    const data = {
      ...newConvData,
      participants: JSON.stringify(newConvData.participants),
      last_message_at: new Date().toISOString()
    };
    createConversationMutation.mutate(data);
    setNewConvData({ name: '', care_recipient_id: '', conversation_type: 'general', participants: [] });
  };

  const handleSendMessage = (content) => {
    if (!user || !selectedConversationId) return;
    
    sendMessageMutation.mutate({
      conversation_id: selectedConversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      content,
      message_type: 'text'
    });
  };

  const handleShareUpdate = ({ type, relatedEntityId, content }) => {
    if (!user || !selectedConversationId) return;
    
    sendMessageMutation.mutate({
      conversation_id: selectedConversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      content,
      message_type: type,
      related_entity_id: relatedEntityId
    });
    setShowShareDialog(false);
    toast.success('Update shared');
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const recipientTeamMembers = selectedConversation
    ? teamMembers.filter(tm => tm.care_recipient_id === selectedConversation.care_recipient_id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          Family Messages
        </h1>
        <p className="text-slate-500 mt-1">Communicate with your care team and family</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowNewConvDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">No conversations yet</p>
                <Button onClick={() => setShowNewConvDialog(true)} size="sm">
                  Start Conversation
                </Button>
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
                recipients={recipients}
              />
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          {selectedConversationId ? (
            <>
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg">{selectedConversation?.name}</CardTitle>
                <p className="text-sm text-slate-500">
                  {recipients.find(r => r.id === selectedConversation?.care_recipient_id)?.full_name}
                </p>
              </CardHeader>
              <MessageThread messages={messages} currentUserEmail={user?.email} />
              <MessageInput
                onSend={handleSendMessage}
                onShareUpdate={() => setShowShareDialog(true)}
                disabled={!user}
              />
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConvDialog} onOpenChange={setShowNewConvDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Conversation Name</Label>
              <Input
                placeholder="e.g., Mom's Care Team"
                value={newConvData.name}
                onChange={(e) => setNewConvData({...newConvData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Care Recipient</Label>
              <Select
                value={newConvData.care_recipient_id}
                onValueChange={(value) => setNewConvData({...newConvData, care_recipient_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conversation Type</Label>
              <Select
                value={newConvData.conversation_type}
                onValueChange={(value) => setNewConvData({...newConvData, conversation_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="care_team">Care Team</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Add Participants</Label>
              <Select
                onValueChange={(value) => {
                  if (!newConvData.participants.includes(value)) {
                    setNewConvData({
                      ...newConvData,
                      participants: [...newConvData.participants, value]
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map(tm => (
                    <SelectItem key={tm.id} value={tm.user_email}>
                      {tm.full_name} ({tm.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newConvData.participants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newConvData.participants.map(email => {
                    const member = teamMembers.find(tm => tm.user_email === email);
                    return (
                      <div key={email} className="px-2 py-1 bg-slate-100 rounded text-sm flex items-center gap-1">
                        {member?.full_name || email}
                        <button
                          onClick={() => setNewConvData({
                            ...newConvData,
                            participants: newConvData.participants.filter(e => e !== email)
                          })}
                          className="ml-1 text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewConvDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={!newConvData.name || !newConvData.care_recipient_id}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Update Dialog */}
      <ShareUpdateDialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        onShare={handleShareUpdate}
        appointments={appointments}
        medications={medications}
        tasks={tasks}
      />
    </div>
  );
}