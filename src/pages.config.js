import Calendar from './pages/Calendar';
import CareNotes from './pages/CareNotes';
import CarePlanBuilder from './pages/CarePlanBuilder';
import CarePlans from './pages/CarePlans';
import CareRecipients from './pages/CareRecipients';
import Checkout from './pages/Checkout';
import ClientAppointments from './pages/ClientAppointments';
import ClientMedicationLog from './pages/ClientMedicationLog';
import ClientPortal from './pages/ClientPortal';
import ClientTasks from './pages/ClientTasks';
import ClientUpdates from './pages/ClientUpdates';
import Collaboration from './pages/Collaboration';
import CommunicationHub from './pages/CommunicationHub';
import Documents from './pages/Documents';
import Emergency from './pages/Emergency';
import EmergencyProfile from './pages/EmergencyProfile';
import MedicationLog from './pages/MedicationLog';
import Medications from './pages/Medications';
import Messages from './pages/Messages';
import RecipientProfile from './pages/RecipientProfile';
import Refills from './pages/Refills';
import Reports from './pages/Reports';
import Scheduling from './pages/Scheduling';
import ShiftHandoff from './pages/ShiftHandoff';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Today from './pages/Today';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Index from './pages/Index';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Calendar": Calendar,
    "CareNotes": CareNotes,
    "CarePlanBuilder": CarePlanBuilder,
    "CarePlans": CarePlans,
    "CareRecipients": CareRecipients,
    "Checkout": Checkout,
    "ClientAppointments": ClientAppointments,
    "ClientMedicationLog": ClientMedicationLog,
    "ClientPortal": ClientPortal,
    "ClientTasks": ClientTasks,
    "ClientUpdates": ClientUpdates,
    "Collaboration": Collaboration,
    "CommunicationHub": CommunicationHub,
    "Documents": Documents,
    "Emergency": Emergency,
    "EmergencyProfile": EmergencyProfile,
    "MedicationLog": MedicationLog,
    "Medications": Medications,
    "Messages": Messages,
    "RecipientProfile": RecipientProfile,
    "Refills": Refills,
    "Reports": Reports,
    "Scheduling": Scheduling,
    "ShiftHandoff": ShiftHandoff,
    "Tasks": Tasks,
    "Team": Team,
    "Today": Today,
    "Dashboard": Dashboard,
    "Appointments": Appointments,
    "Index": Index,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};