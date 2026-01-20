import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function TaskCommentsDialog({ task, open, onOpenChange }) {
  const [comment, setComment] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: comments = [] } = useQuery({
    queryKey: ['taskComments', task?.id],
    queryFn: () => base44.entities.TaskComment.filter(
      { task_id: task.id },
      '-created_date'
    ),
    enabled: !!task?.id && open
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers', task?.care_recipient_id],
    queryFn: () => base44.entities.TeamMember.filter({
      care_recipient_id: task.care_recipient_id,
      active: true
    }),
    enabled: !!task?.care_recipient_id && open
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.TaskComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['taskComments', task?.id]);
      setComment('');
      toast.success('Comment added');
    }
  });

  const handleSubmit = () => {
    if (!comment.trim()) return;

    // Extract @mentions
    const mentionRegex = /@(\S+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(comment)) !== null) {
      const mentionedMember = teamMembers.find(m => 
        m.full_name.toLowerCase().includes(match[1].toLowerCase()) ||
        m.user_email.toLowerCase().includes(match[1].toLowerCase())
      );
      if (mentionedMember) {
        mentions.push(mentionedMember.user_email);
      }
    }

    addCommentMutation.mutate({
      task_id: task.id,
      care_recipient_id: task.care_recipient_id,
      author_email: user?.email,
      author_name: user?.full_name,
      comment: comment.trim(),
      mentions: JSON.stringify([...new Set(mentions)])
    });
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
          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No comments yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-slate-800">{c.author_name}</span>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(c.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.comment}</p>
                  {c.mentions && JSON.parse(c.mentions).length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                      <AtSign className="w-3 h-3" />
                      <span>Mentioned {JSON.parse(c.mentions).length} team member(s)</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
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