import Dashboard from './pages/Dashboard';
import CareRecipients from './pages/CareRecipients';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "CareRecipients": CareRecipients,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};