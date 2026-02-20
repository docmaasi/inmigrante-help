import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Pill } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import CaregiverDashboardWidget from './CaregiverDashboardWidget';
import AssignedTasksSummary from './AssignedTasksSummary';
import ImportantAlerts from './ImportantAlerts';
import NotificationsWidget from './NotificationsWidget';

export default function TodayWidgetsGrid({
  widgets,
  widgetManager,
  unreadNotifications,
  todayAppointments,
  todayTasks,
  overdueTasks,
  activeMedications,
  tasks,
  appointments,
  medications,
  recipients,
  setCompletingTask,
  priorityColors,
  getRecipientName,
  formatTime,
  userEmail,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {widgets.map(widget => {
        if (widget.id === 'notifications') {
          return (
            <CaregiverDashboardWidget
              key={widget.id}
              widgetId={widget.id}
              title={`${widget.title} (${unreadNotifications.length})`}
              icon={widget.icon}
              isPinned={widgetManager.config[widget.id]?.pinned}
              onPin={() => widgetManager.pinWidget(widget.id)}
              onHide={() => widgetManager.hideWidget(widget.id)}
            >
              <NotificationsWidget notifications={unreadNotifications} />
            </CaregiverDashboardWidget>
          );
        }

        if (widget.id === 'todaySchedule') {
          return (
            <CaregiverDashboardWidget
              key={widget.id}
              widgetId={widget.id}
              title={`${widget.title} (${todayAppointments.length + todayTasks.length})`}
              icon={widget.icon}
              isPinned={widgetManager.config[widget.id]?.pinned}
              onPin={() => widgetManager.pinWidget(widget.id)}
              onHide={() => widgetManager.hideWidget(widget.id)}
            >
              <div className="space-y-3">
                {todayAppointments.length === 0 && todayTasks.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No appointments or tasks scheduled for today</p>
                ) : (
                  <>
                    {todayAppointments.map(apt => (
                      <div key={`apt-${apt.id}`} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                        <Clock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800">{apt.title}</div>
                          <div className="text-sm text-slate-600">
                            {getRecipientName(apt.care_recipient_id)}
                            {apt.time && ` • ${formatTime(apt.time)}`}
                          </div>
                        </div>
                        <Badge className="bg-teal-100 text-teal-700 text-xs">{apt.appointment_type}</Badge>
                      </div>
                    ))}
                    {todayTasks.map(task => (
                      <div key={`task-${task.id}`} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <button
                          onClick={() => setCompletingTask(task)}
                          className="mt-1 text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800">{task.title}</div>
                          <div className="text-sm text-slate-600">
                            {getRecipientName(task.care_recipient_id)}
                          </div>
                        </div>
                        <Badge className={`${priorityColors[task.priority]} text-xs`}>{task.priority}</Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CaregiverDashboardWidget>
          );
        }

        if (widget.id === 'urgentTasks') {
          return (
            <CaregiverDashboardWidget
              key={widget.id}
              widgetId={widget.id}
              title={`${widget.title} (${overdueTasks.length})`}
              icon={widget.icon}
              isPinned={widgetManager.config[widget.id]?.pinned}
              onPin={() => widgetManager.pinWidget(widget.id)}
              onHide={() => widgetManager.hideWidget(widget.id)}
            >
              {overdueTasks.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No overdue tasks</p>
              ) : (
                <div className="space-y-2">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800">{task.title}</div>
                        <div className="text-sm text-red-700">
                          Due: {format(parseISO(task.due_date), 'MMM d')} • {getRecipientName(task.care_recipient_id)}
                        </div>
                      </div>
                      <Badge className="bg-red-600 text-white text-xs">{task.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CaregiverDashboardWidget>
          );
        }

        if (widget.id === 'importantAlerts') {
          return (
            <CaregiverDashboardWidget
              key={widget.id}
              widgetId={widget.id}
              title={widget.title}
              icon={widget.icon}
              isPinned={widgetManager.config[widget.id]?.pinned}
              onPin={() => widgetManager.pinWidget(widget.id)}
              onHide={() => widgetManager.hideWidget(widget.id)}
            >
              <ImportantAlerts
                tasks={tasks}
                appointments={appointments}
                medications={medications}
                recipients={recipients}
              />
            </CaregiverDashboardWidget>
          );
        }

        if (widget.id === 'assignedTasks') {
          return (
            <CaregiverDashboardWidget
              key={widget.id}
              widgetId={widget.id}
              title={widget.title}
              icon={widget.icon}
              isPinned={widgetManager.config[widget.id]?.pinned}
              onPin={() => widgetManager.pinWidget(widget.id)}
              onHide={() => widgetManager.hideWidget(widget.id)}
            >
              <AssignedTasksSummary
                tasks={tasks}
                userEmail={userEmail}
                recipients={recipients}
              />
            </CaregiverDashboardWidget>
          );
        }

        if (widget.id === 'medications') {
          return (
            <CaregiverDashboardWidget
              key={widget.id}
              widgetId={widget.id}
              title={`${widget.title} (${activeMedications.length})`}
              icon={widget.icon}
              isPinned={widgetManager.config[widget.id]?.pinned}
              onPin={() => widgetManager.pinWidget(widget.id)}
              onHide={() => widgetManager.hideWidget(widget.id)}
            >
              <div className="space-y-2">
                {activeMedications.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No active medications</p>
                ) : (
                  <>
                    {activeMedications.map(med => (
                      <div key={med.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Pill className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-800">{med.medication_name}</div>
                          <div className="text-sm text-slate-600">
                            {getRecipientName(med.care_recipient_id)} • {med.dosage}
                            {med.time_of_day && ` • ${formatTime(med.time_of_day)}`}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 text-xs whitespace-nowrap">{med.frequency}</Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CaregiverDashboardWidget>
          );
        }

        return null;
      })}
    </div>
  );
}
