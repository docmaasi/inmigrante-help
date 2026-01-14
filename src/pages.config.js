import Appointments from './pages/Appointments';
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
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Emergency from './pages/Emergency';
import EmergencyProfile from './pages/EmergencyProfile';
import Landing from './pages/Landing';
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
import PrivacyPolicy from './pages/PrivacyPolicy';
import LegalDisclosure from './pages/LegalDisclosure';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Appointments": Appointments,
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
    "Dashboard": Dashboard,
    "Documents": Documents,
    "Emergency": Emergency,
    "EmergencyProfile": EmergencyProfile,
    "Landing": Landing,
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
    "PrivacyPolicy": PrivacyPolicy,
    "LegalDisclosure": LegalDisclosure,
    "TermsOfService": TermsOfService,
    "CookiePolicy": CookiePolicy,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};