import Dashboard from './pages/Dashboard';
import CareRecipients from './pages/CareRecipients';
import Appointments from './pages/Appointments';
import Medications from './pages/Medications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CareRecipients": CareRecipients,
    "Appointments": Appointments,
    "Medications": Medications,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};