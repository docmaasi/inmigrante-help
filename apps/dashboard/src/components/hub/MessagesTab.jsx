import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from 'lucide-react';
import ConversationList from '../messaging/ConversationList';
import MessageThread from '../messaging/MessageThread';
import MessageInput from '../messaging/MessageInput';

export function MessagesTab({
  conversations,
  selectedConversationId,
  selectedConversation,
  messages,
  recipients,
  user,
  onSelectConversation,
  onNewConversation,
  onSendMessage,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm shadow-sm border border-[#4F46E5]/10">
        <CardHeader className="border-b border-[#4F46E5]/10 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#4F46E5]">Conversations</CardTitle>
            <Button
              size="sm"
              onClick={onNewConversation}
              className="bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] hover:from-[#4F46E5]/90 hover:to-[#8B7EC8]/90 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-[#4F46E5]/10 to-[#8B7EC8]/15 rounded-full flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-[#8B7EC8]" />
              </div>
              <p className="text-[#8B7EC8] text-sm mb-4">No conversations yet</p>
              <Button onClick={onNewConversation} size="sm" className="bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] text-white">
                Start Conversation
              </Button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId}
              onSelect={onSelectConversation}
              recipients={recipients}
            />
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 flex flex-col h-[600px] bg-white/80 backdrop-blur-sm shadow-sm border border-[#4F46E5]/10">
        {selectedConversationId ? (
          <>
            <CardHeader className="border-b border-[#4F46E5]/10 pb-4">
              <CardTitle className="text-lg font-semibold text-[#4F46E5]">{selectedConversation?.title}</CardTitle>
              <p className="text-sm text-[#8B7EC8]">
                {recipients.find(r => r.id === selectedConversation?.care_recipient_id)?.full_name}
              </p>
            </CardHeader>
            <MessageThread messages={messages} currentUserEmail={user?.email} />
            <MessageInput onSend={onSendMessage} disabled={!user} />
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#4F46E5]/10 to-[#8B7EC8]/15 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#8B7EC8]" />
              </div>
              <p className="text-[#8B7EC8]">Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
