import React, { useState } from 'react';
import { useTaskComments, useAddTaskComment, useTeamMembers } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function TaskCommentsDialog({ task, open, onOpenChange }) {
  const [comment, setComment] = useState('');
  const { user, profile } = useAuth();

  const { data: comments = [] } = useTaskComments(task?.id);
  const { data: teamMembers = [] } = useTeamMembers();

  const addCommentMutation = useAddTaskComment();

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        taskId: task.id,
        content: comment.trim()
      });
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const insertMention = (memberName) => {
    setComment(prev => prev + `@${memberName} `);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Task Comments: {task?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No comments yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-slate-800">
                        {c.profiles?.full_name || 'Unknown User'}
                      </span>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600">Quick mention:</span>
              {teamMembers.map(member => (
                <Button
                  key={member.id}
                  size="sm"
                  variant="outline"
                  onClick={() => insertMention(member.full_name)}
                  className="h-6 text-xs"
                >
                  <AtSign className="w-3 h-3 mr-1" />
                  {member.full_name}
                </Button>
              ))}
            </div>
            <Textarea
              placeholder="Add a comment... Use @name to mention team members"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-2"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!comment.trim() || addCommentMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {addCommentMutation.isPending ? 'Sending...' : 'Send Comment'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
