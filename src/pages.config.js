import Dashboard from './pages/Dashboard';
import CareRecipients from './pages/CareRecipients';
import Appointments from './pages/Appointments';
import Medications from './pages/Medications';
import Tasks from './pages/Tasks';
import CareNotes from './pages/CareNotes';
import Calendar from './pages/Calendar';
import Emergency from './pages/Emergency';
import MedicationLog from './pages/MedicationLog';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CareRecipients": CareRecipients,
    "Appointments": Appointments,
    "Medications": Medications,
    "Tasks": Tasks,
    "CareNotes": CareNotes,
    "Calendar": Calendar,
    "Emergency": Emergency,
    "MedicationLog": MedicationLog,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};