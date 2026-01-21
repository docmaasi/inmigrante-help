import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useCreateConversation,
  useCareRecipients,
  useTeamMembers,
  useAppointments,
  useMedications,
  useTasks,
} from '@/hooks';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import ShareUpdateDialog from '../components/messaging/ShareUpdateDialog';
import ExternalCommLog from '../components/messaging/ExternalCommLog';

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newConvData, setNewConvData] = useState({
    name: '',
    care_recipient_id: '',
    conversation_type: 'general',
    participants: []
  });

  const { data: conversations = [] } = useConversations();
  const { data: messages = [] } = useMessages(selectedConversationId);
  const { data: recipients = [] } = useCareRecipients();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: appointments = [] } = useAppointments();
  const { data: medications = [] } = useMedications();
  const { data: tasks = [] } = useTasks();

  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();

  const handleCreateConversation = () => {
    createConversationMutation.mutate(
      {
        name: newConvData.name,
        care_recipient_id: newConvData.care_recipient_id,
        conversation_type: newConvData.conversation_type,
        participants: newConvData.participants,
        last_message_at: new Date().toISOString(),
      },
      {
        onSuccess: (newConv) => {
          setSelectedConversationId(newConv.id);
          setShowNewConvDialog(false);
          toast.success('Conversation created');
          setNewConvData({ name: '', care_recipient_id: '', conversation_type: 'general', participants: [] });
        },
      }
    );
  };

  const handleSendMessage = (content) => {
    if (!user || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content,
      messageType: 'text',
    });
  };

  const handleShareUpdate = ({ type, relatedEntityId, content }) => {
    if (!user || !selectedConversationId) return;

    sendMessageMutation.mutate(
      {
        conversationId: selectedConversationId,
        content,
        messageType: type,
      },
      {
        onSuccess: () => {
          setShowShareDialog(false);
          toast.success('Update shared');
        },
      }
    );
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Transform recipients to match expected format
  const formattedRecipients = recipients.map(r => ({
    ...r,
    full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-teal-600" />
            Communications
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Team messaging and external communication logs</p>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Team Messages
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              External Communications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <Card className="lg:col-span-1 shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowNewConvDialog(true)}
                      className="bg-teal-600 hover:bg-teal-700"
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
                      recipients={formattedRecipients}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Message Thread */}
              <Card className="lg:col-span-2 flex flex-col h-[600px] shadow-sm border-slate-200">
                {selectedConversationId ? (
                  <>
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle className="text-lg">{selectedConversation?.name}</CardTitle>
                      <p className="text-sm text-slate-500">
                        {formattedRecipients.find(r => r.id === selectedConversation?.care_recipient_id)?.full_name}
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
          </TabsContent>

          <TabsContent value="external">
            <ExternalCommLog />
          </TabsContent>
        </Tabs>

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
                  {formattedRecipients.map(r => (
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
                    <SelectItem key={tm.id} value={tm.email || tm.id}>
                      {tm.full_name} ({tm.relationship || tm.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newConvData.participants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newConvData.participants.map(participantId => {
                    const member = teamMembers.find(tm => (tm.email || tm.id) === participantId);
                    return (
                      <div key={participantId} className="px-2 py-1 bg-slate-100 rounded text-sm flex items-center gap-1">
                        {member?.full_name || participantId}
                        <button
                          onClick={() => setNewConvData({
                            ...newConvData,
                            participants: newConvData.participants.filter(e => e !== participantId)
                          })}
                          className="ml-1 text-slate-500 hover:text-slate-700"
                        >
                          x
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
                disabled={!newConvData.name || !newConvData.care_recipient_id || createConversationMutation.isPending}
              >
                {createConversationMutation.isPending ? 'Creating...' : 'Create'}
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
    </div>
  );
}
