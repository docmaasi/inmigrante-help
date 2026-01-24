// Care Recipients
export {
  useCareRecipients,
  useCareRecipient,
  useCreateCareRecipient,
  useUpdateCareRecipient,
  useDeleteCareRecipient,
} from './use-care-recipients';

// Medications
export {
  useMedications,
  useMedication,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
  useMedicationLogs,
  useLogMedication,
} from './use-medications';

// Tasks
export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useDeleteTask,
  useTaskComments,
  useAddTaskComment,
} from './use-tasks';

// Appointments
export {
  useAppointments,
  useUpcomingAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from './use-appointments';

// Messages
export {
  useConversations,
  useConversation,
  useCreateConversation,
  useMessages,
  useSendMessage,
  useMarkMessagesRead,
} from './use-messages';

// Team
export {
  useTeamMembers,
  useTeamMember,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useCaregiverShifts,
  useCreateShift,
  useUpdateShift,
  useTeamAnnouncements,
  useCreateAnnouncement,
} from './use-team';

// Care Plans & Notes
export {
  useCarePlans,
  useCarePlan,
  useCreateCarePlan,
  useUpdateCarePlan,
  useDeleteCarePlan,
  useUpdateCarePlanDetails,
  useCareNotes,
  useCreateCareNote,
  useUpdateCareNote,
  useDeleteCareNote,
} from './use-care-plans';

// Notifications
export {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useCreateNotifications,
} from './use-notifications';

// Documents
export {
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useUploadDocument,
} from './use-documents';

// Widget Preferences
export {
  useWidgetPreferences,
  useUpdateWidgetPreferences,
} from './use-widget-preferences';

// Medication Refills
export {
  useMedicationRefills,
  useMedicationRefill,
  useCreateMedicationRefill,
  useUpdateMedicationRefill,
  useDeleteMedicationRefill,
  useBulkCreateMedicationRefills,
} from './use-refills';

// Client Access
export {
  useClientAccess,
  useClientAccessByRecipient,
  useValidateClientAccess,
  useCreateClientAccess,
  useUpdateClientAccess,
  useRevokeClientAccess,
} from './use-client-access';

// Permissions
export { usePermissions } from './use-permissions';
export type { UsePermissionsReturn } from './use-permissions';

// Admin Users
export {
  useAdminUsers,
  useAdminUserById,
  useUpdateUserRole,
  useDisableUser,
  useEnableUser,
  useAdminUserStats,
} from './admin/use-admin-users';
export type {
  AdminUserProfile,
  AdminUserFilters,
} from './admin/use-admin-users';

// Admin Activity
export {
  useAdminActivity,
  useAdminActivityById,
  useLogAdminAction,
  useAdminActivityStats,
} from './admin/use-admin-activity';

// System Settings
export {
  useSystemSettings,
  useSystemSetting,
  useUpdateSetting,
  useUpdateMultipleSettings,
  useFeatureFlags,
  useFeatureFlag,
  useToggleFeatureFlag,
  useCreateFeatureFlag,
  useIsFeatureEnabled,
} from './admin/use-system-settings';
export type {
  SystemSetting,
  FeatureFlag,
  ParsedSystemSettings,
} from './admin/use-system-settings';
