import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import CareNotes from './pages/CareNotes';
import CarePlans from './pages/CarePlans';
import CareRecipients from './pages/CareRecipients';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "Appointments": Appointments,
    "Calendar": Calendar,
    "CareNotes": CareNotes,
    "CarePlans": CarePlans,
    "CareRecipients": CareRecipients,
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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};