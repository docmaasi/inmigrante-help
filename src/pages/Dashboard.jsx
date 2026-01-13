import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Pill, ListTodo, Users } from 'lucide-react';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Skeleton } from '@/components/ui/skeleton';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatCard from '../components/dashboard/StatCard';
import UpcomingAppointments from '../components/dashboard/UpcomingAppointments';
import TodaysMedications from '../components/dashboard/TodaysMedications';
import UrgentTasks from '../components/dashboard/UrgentTasks';
import ActivityLog from '../components/accountability/ActivityLog';
import RefillTracker from '../components/medications/RefillTracker';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import HiddenWidgets from '../components/dashboard/HiddenWidgets';
import useWidgetManager from '../components/dashboard/WidgetManager';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import QuickActions from '../components/dashboard/QuickActions';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { config, hideWidget, pinWidget, reorderWidgets, showWidget } = useWidgetManager(user);

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date'),
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list(),
  });

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-due_date'),
  });

  const upcomingAppointments = appointments?.filter?.(apt => !apt.completed && isAfter(parseISO(apt.date), startOfToday())).slice(0, 3) || [];

  const activeMedications = medications?.filter?.(med => med.active).slice(0, 3) || [];

  const urgentTasks = tasks?.filter?.(task => task.status !== 'completed' && task.priority === 'high').slice(0, 3) || [];

  const pendingTasksCount = tasks?.filter?.(t => t.status !== 'completed').length || 0;

  const widgets = [
    { id: 'upcomingAppointments', title: 'Upcoming Appointments', component: <UpcomingAppointments appointments={upcomingAppointments} /> },
    { id: 'todaysMedications', title: "Today's Medications", component: <TodaysMedications medications={activeMedications} /> },
    { id: 'urgentTasks', title: 'Urgent Tasks', component: <UrgentTasks tasks={urgentTasks} onTaskUpdate={refetchTasks} /> },
    { id: 'activityLog', title: 'Recent Activity', component: <ActivityLog limit={15} /> },
    { id: 'refillTracker', title: 'Upcoming Refills', component: <RefillTracker /> },
  ];

  const sortedWidgets = widgets
    .filter(w => config[w.id]?.visible !== false)
    .sort((a, b) => (config[a.id]?.order ?? 999) - (config[b.id]?.order ?? 999));

  const pinnedWidgets = sortedWidgets.filter(w => config[w.id]?.pinned);
  const unpinnedWidgets = sortedWidgets.filter(w => !config[w.id]?.pinned);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const allWidgets = [...pinnedWidgets, ...unpinnedWidgets];
    const [movedWidget] = allWidgets.splice(source.index, 1);
    allWidgets.splice(destination.index, 0, movedWidget);

    reorderWidgets(allWidgets.map(w => w.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <WelcomeHeader userName={user?.full_name || 'there'} />

        <OnboardingWizard />

        {/* Stat Cards */}
        {config.statCards?.visible !== false && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Care Recipients"
              value={recipients.length}
              icon={Users}
              color="blue"
              link="CareRecipients"
            />
            <StatCard 
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
              icon={Calendar}
              color="purple"
              link="Appointments"
            />
            <StatCard 
              title="Active Medications"
              value={activeMedications.length}
              icon={Pill}
              color="green"
              link="Medications"
            />
            <StatCard 
              title="Pending Tasks"
              value={pendingTasksCount}
              icon={ListTodo}
              color="orange"
              link="Tasks"
            />
          </div>
        )}

        <HiddenWidgets config={config} onShowWidget={showWidget} />

        {/* Pinned Widgets */}
        {pinnedWidgets.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pinned</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pinnedWidgets.map((widget, idx) => (
                <DashboardWidget
                  key={widget.id}
                  widget={widget}
                  onHide={hideWidget}
                  onPin={pinWidget}
                  isPinned={true}
                >
                  <div>
                    <h2 className="text-lg font-medium text-slate-800 mb-4">{widget.title}</h2>
                    {widget.component}
                  </div>
                </DashboardWidget>
              ))}
            </div>
          </div>
        )}

        {/* Draggable Widgets */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-4' : ''}`}
              >
                {unpinnedWidgets.map((widget, idx) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={pinnedWidgets.length + idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <DashboardWidget
                          widget={widget}
                          onHide={hideWidget}
                          onPin={pinWidget}
                          isDragging={snapshot.isDragging}
                          dragHandleProps={provided.dragHandleProps}
                          isPinned={false}
                        >
                          <div>
                            <h2 className="text-lg font-medium text-slate-800 mb-4">{widget.title}</h2>
                            {widget.component}
                          </div>
                        </DashboardWidget>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <QuickActions />
      </div>
    </div>
  );
}