import Appointments from "./pages/Appointments";
import Calendar from "./pages/Calendar";
import CareNotes from "./pages/CareNotes";
import CarePlanBuilder from "./pages/CarePlanBuilder";
import CarePlans from "./pages/CarePlans";
import CareRecipients from "./pages/CareRecipients";
import { Checkout } from "./pages/Checkout";
import ClientAppointments from "./pages/ClientAppointments";
import ClientMedicationLog from "./pages/ClientMedicationLog";
import { ClientPortal } from "./pages/ClientPortal";
import ClientTasks from "./pages/ClientTasks";
import { ClientUpdates } from "./pages/ClientUpdates";
import Collaboration from "./pages/Collaboration";
import CommunicationHub from "./pages/CommunicationHub";
import Dashboard from "./pages/Dashboard";
import Diagnostics from "./pages/Diagnostics";
import Documents from "./pages/Documents";
import Emergency from "./pages/Emergency";
import EmergencyProfile from "./pages/EmergencyProfile";
import MedicationLog from "./pages/MedicationLog";
import Medications from "./pages/Medications";
import Messages from "./pages/Messages";
import { ReceiptsPage as Receipts } from "./pages/Receipts";
import RecipientProfile from "./pages/RecipientProfile";
import Refills from "./pages/Refills";
import Reports from "./pages/Reports";
import Scheduling from "./pages/Scheduling";
import Settings from "./pages/Settings";
import ShiftHandoff from "./pages/ShiftHandoff";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Today from "./pages/Today";
import __Layout from "./Layout.jsx";

export const PAGES = {
  Appointments,
  Calendar,
  CareNotes,
  CarePlanBuilder,
  CarePlans,
  CareRecipients,
  Checkout,
  ClientAppointments,
  ClientMedicationLog,
  ClientPortal,
  ClientTasks,
  ClientUpdates,
  Collaboration,
  CommunicationHub,
  Dashboard,
  Diagnostics,
  Documents,
  Emergency,
  EmergencyProfile,
  MedicationLog,
  Medications,
  Messages,
  Receipts,
  RecipientProfile,
  Refills,
  Reports,
  Scheduling,
  Settings,
  ShiftHandoff,
  Tasks,
  Team,
  Today,
};

export const pagesConfig = {
  mainPage: "Today",
  Pages: PAGES,
  Layout: __Layout,
};
