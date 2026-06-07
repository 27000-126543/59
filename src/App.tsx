import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "@/components/Layout/AppLayout";

import Login from "@/pages/Login";
import Messages from "@/pages/Messages";

import VisitorHome from "@/pages/Visitor/Home";
import VisitorBooking from "@/pages/Visitor/Booking";
import VisitorTicket from "@/pages/Visitor/Ticket";
import VisitorGuide from "@/pages/Visitor/Guide";
import VisitorFeedback from "@/pages/Visitor/Feedback";

import CuratorHome from "@/pages/Curator/Home";
import CuratorExhibitions from "@/pages/Curator/Exhibitions";
import CuratorCreateExhibition from "@/pages/Curator/CreateExhibition";
import CuratorWorkOrders from "@/pages/Curator/WorkOrders";

import ConservatorHome from "@/pages/Conservator/Home";
import ConservatorInspections from "@/pages/Conservator/Inspections";
import ConservatorMaintenance from "@/pages/Conservator/Maintenance";
import ConservatorWorkOrders from "@/pages/Conservator/WorkOrders";

import SecurityHome from "@/pages/Security/Home";
import SecurityCapacity from "@/pages/Security/Capacity";
import SecurityAlerts from "@/pages/Security/Alerts";

import DirectorHome from "@/pages/Director/Home";
import DirectorReports from "@/pages/Director/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/visitor/home"
          element={
            <AppLayout>
              <VisitorHome />
            </AppLayout>
          }
        />
        <Route
          path="/visitor/booking"
          element={
            <AppLayout>
              <VisitorBooking />
            </AppLayout>
          }
        />
        <Route
          path="/visitor/ticket"
          element={
            <AppLayout>
              <VisitorTicket />
            </AppLayout>
          }
        />
        <Route
          path="/visitor/guide"
          element={
            <AppLayout>
              <VisitorGuide />
            </AppLayout>
          }
        />
        <Route
          path="/visitor/feedback"
          element={
            <AppLayout>
              <VisitorFeedback />
            </AppLayout>
          }
        />

        <Route
          path="/curator/home"
          element={
            <AppLayout>
              <CuratorHome />
            </AppLayout>
          }
        />
        <Route
          path="/curator/exhibitions"
          element={
            <AppLayout>
              <CuratorExhibitions />
            </AppLayout>
          }
        />
        <Route
          path="/curator/exhibitions/create"
          element={
            <AppLayout>
              <CuratorCreateExhibition />
            </AppLayout>
          }
        />
        <Route
          path="/curator/workorders"
          element={
            <AppLayout>
              <CuratorWorkOrders />
            </AppLayout>
          }
        />

        <Route
          path="/conservator/home"
          element={
            <AppLayout>
              <ConservatorHome />
            </AppLayout>
          }
        />
        <Route
          path="/conservator/inspections"
          element={
            <AppLayout>
              <ConservatorInspections />
            </AppLayout>
          }
        />
        <Route
          path="/conservator/maintenance"
          element={
            <AppLayout>
              <ConservatorMaintenance />
            </AppLayout>
          }
        />
        <Route
          path="/conservator/workorders"
          element={
            <AppLayout>
              <ConservatorWorkOrders />
            </AppLayout>
          }
        />

        <Route
          path="/security/home"
          element={
            <AppLayout>
              <SecurityHome />
            </AppLayout>
          }
        />
        <Route
          path="/security/capacity"
          element={
            <AppLayout>
              <SecurityCapacity />
            </AppLayout>
          }
        />
        <Route
          path="/security/alerts"
          element={
            <AppLayout>
              <SecurityAlerts />
            </AppLayout>
          }
        />

        <Route
          path="/director/home"
          element={
            <AppLayout>
              <DirectorHome />
            </AppLayout>
          }
        />
        <Route
          path="/director/reports"
          element={
            <AppLayout>
              <DirectorReports />
            </AppLayout>
          }
        />

        <Route
          path="/messages"
          element={
            <AppLayout>
              <Messages />
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}
