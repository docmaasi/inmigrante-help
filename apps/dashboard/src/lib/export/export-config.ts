export interface ExportCategory {
  id: string;
  label: string;
  table: string;
  dateField: string;
  superAdminOnly: boolean;
}

export const EXPORT_CATEGORIES: ExportCategory[] = [
  {
    id: 'care_recipients',
    label: 'Care Recipients',
    table: 'care_recipients',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'team_members',
    label: 'Team Members',
    table: 'team_members',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'medications',
    label: 'Medications',
    table: 'medications',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'medication_logs',
    label: 'Medication Logs',
    table: 'medication_logs',
    dateField: 'administered_time',
    superAdminOnly: false,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    table: 'tasks',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'appointments',
    label: 'Appointments',
    table: 'appointments',
    dateField: 'start_time',
    superAdminOnly: false,
  },
  {
    id: 'care_plans',
    label: 'Care Plans',
    table: 'care_plans',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'care_notes',
    label: 'Care Notes',
    table: 'care_notes',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'conversations',
    label: 'Conversations',
    table: 'conversations',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'caregiver_shifts',
    label: 'Caregiver Shifts',
    table: 'caregiver_shifts',
    dateField: 'start_time',
    superAdminOnly: false,
  },
  {
    id: 'documents',
    label: 'Documents (metadata)',
    table: 'documents',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    table: 'notifications',
    dateField: 'created_at',
    superAdminOnly: false,
  },
  {
    id: 'admin_activity_logs',
    label: 'Admin Activity Logs',
    table: 'admin_activity_logs',
    dateField: 'created_at',
    superAdminOnly: true,
  },
];

export type ExportFormat = 'csv' | 'excel' | 'pdf';
