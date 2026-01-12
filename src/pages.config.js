import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import CareNotes from './pages/CareNotes';
import CarePlans from './pages/CarePlans';
import CareRecipients from './pages/CareRecipients';
import ClientAppointments from './pages/ClientAppointments';
import ClientMedicationLog from './pages/ClientMedicationLog';
import ClientPortal from './pages/ClientPortal';
import ClientTasks from './pages/ClientTasks';
import ClientUpdates from './pages/ClientUpdates';
import Collaboration from './pages/Collaboration';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import MedicationLog from './pages/MedicationLog';
import Medications from './pages/Medications';
import Messages from './pages/Messages';
import RecipientProfile from './pages/RecipientProfile';
import Refills from './pages/Refills';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Scheduling from './pages/Scheduling';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Appointments": Appointments,
    "Calendar": Calendar,
    "CareNotes": CareNotes,
    "CarePlans": CarePlans,
    "CareRecipients": CareRecipients,
    "ClientAppointments": ClientAppointments,
    "ClientMedicationLog": ClientMedicationLog,
    "ClientPortal": ClientPortal,
    "ClientTasks": ClientTasks,
    "ClientUpdates": ClientUpdates,
    "Collaboration": Collaboration,
    "Dashboard": Dashboard,
    "Emergency": Emergency,
    "MedicationLog": MedicationLog,
    "Medications": Medications,
    "Messages": Messages,
    "RecipientProfile": RecipientProfile,
    "Refills": Refills,
    "Reports": Reports,
    "Tasks": Tasks,
    "Team": Team,
    "Scheduling": Scheduling,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};