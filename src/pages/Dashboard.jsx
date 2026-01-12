import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Pill, ListTodo, Users } from 'lucide-react';
import { isAfter, parseISO, startOfToday } from 'date-fns';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatCard from '../components/dashboard/StatCard';
import UpcomingAppointments from '../components/dashboard/UpcomingAppointments';
import TodaysMedications from '../components/dashboard/TodaysMedications';
import UrgentTasks from '../components/dashboard/UrgentTasks';
import ActivityLog from '../components/accountability/ActivityLog';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: recipients = [] } = useQuery({
    queryKey: ['recipients'],
    queryFn: () => base44.entities.CareRecipient.list(),
  });

  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date'),
  });

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list(),
  });

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.CareTask.list('-due_date'),
  });

  const upcomingAppointments = appointments
    .filter(apt => !apt.completed && isAfter(parseISO(apt.date), startOfToday()))
    .slice(0, 3);

  const activeMedications = medications.filter(med => med.active).slice(0, 3);

  const urgentTasks = tasks
    .filter(task => task.status !== 'completed' && task.priority === 'high')
    .slice(0, 3);

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <WelcomeHeader userName={user?.full_name || 'there'} />

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-slate-800 mb-4">Upcoming Appointments</h2>
            <UpcomingAppointments appointments={upcomingAppointments} />
          </div>

          <div>
            <h2 className="text-lg font-medium text-slate-800 mb-4">Today's Medications</h2>
            <TodaysMedications medications={activeMedications} />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Urgent Tasks</h2>
            <UrgentTasks tasks={urgentTasks} onTaskUpdate={refetchTasks} />
          </div>
        </div>
      </div>
    </div>
  );
}