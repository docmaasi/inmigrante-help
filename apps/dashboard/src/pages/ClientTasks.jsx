import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ClientPortalNav from '../components/client/ClientPortalNav';
import { createPageUrl } from '../utils';

export default function ClientTasks() {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [recipientId, setRecipientId] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate(createPageUrl('Dashboard'));
      return;
    }

    const fetchClientAccess = async () => {
      const { data: accesses, error } = await supabase
        .from('client_access')
        .select('care_recipient_id')
        .eq('is_active', true)
        .limit(1);

      if (error || !accesses || accesses.length === 0) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      setRecipientId(accesses[0].care_recipient_id);
    };

    fetchClientAccess();
  }, [user, isAuthLoading, navigate]);

  const { data: recipient } = useQuery({
    queryKey: ['recipient', recipientId],
    queryFn: async () => {
      if (!recipientId) return null;
      const { data, error } = await supabase
        .from('care_recipients')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['clientTasks', recipientId],
    queryFn: async () => {
      if (!recipientId) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('care_recipient_id', recipientId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!recipientId
  });

  const priorityColors = {
    low: 'bg-teal-100 text-teal-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  if (!recipient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const recipientFullName = `${recipient.first_name} ${recipient.last_name}`;
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientPortalNav careRecipientName={recipientFullName} currentPageName="ClientTasks" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Care Tasks</h1>
          <p className="text-slate-600">View assigned tasks and care activities</p>
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Active Tasks ({pendingTasks.length})</h2>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <Card key={task.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          {task.due_date && (
                            <span>Due: {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                          )}
                          {task.category && (
                            <span className="capitalize">{task.category.replace(/_/g, ' ')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold whitespace-nowrap bg-slate-100 text-slate-800 capitalize">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Completed ({completedTasks.length})</h2>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <Card key={task.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-600 line-through">{task.title}</p>
                        {task.notes && (
                          <p className="text-xs text-slate-500 mt-1">{task.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <ListTodo className="w-12 h-12 text-teal-200 mx-auto mb-4" />
              <p className="text-slate-500">No tasks assigned</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
