import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import { PublicLayout } from "../layouts/PublicLayout";
import { CandidateLayout } from "../layouts/CandidateLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { RoleBasedRoute } from "../components/layout/RoleBasedRoute";

// Public Pages
import { LandingPage } from "../pages/public/LandingPage";
import { AuthPage } from "../pages/public/AuthPage";

// Candidate Pages
import { CandidateDashboard } from "../pages/candidate/Dashboard";
import { Profile } from "../pages/candidate/Profile";
import { UniversityList } from "../pages/candidate/UniversityList";
import { UniversityDetail } from "../pages/candidate/UniversityDetail";
import { ApplicationForm } from "../pages/candidate/ApplicationForm";
import { MyApplications } from "../pages/candidate/MyApplications";
import { ApplicationDetail as CandidateApplicationDetail } from "../pages/candidate/ApplicationDetail";
import { Results } from "../pages/candidate/Results";
import { NotificationList as CandidateNotificationList } from "../pages/candidate/NotificationList";

// Admin Pages
import { AdminDashboard } from "../pages/admin/Dashboard";
import { UniversityManagement } from "../pages/admin/UniversityManagement";
import { MajorManagement } from "../pages/admin/MajorManagement";
import { SubjectGroupList } from "../pages/admin/SubjectGroupList";
import { AdmissionRoundList } from "../pages/admin/AdmissionRoundList";
import { CandidateManagement } from "../pages/admin/CandidateManagement";
import { ApplicationManagement } from "../pages/admin/ApplicationManagement";
import { AdminApplicationDetail } from "../pages/admin/ApplicationDetail";
import { NotificationLogList as AdminNotificationList } from "../pages/admin/NotificationLogList";

// Error Pages
import { ForbiddenPage } from "../pages/errors/ForbiddenPage";
import { NotFoundPage } from "../pages/errors/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <AuthPage /> },
      { path: "register", element: <AuthPage /> },
      { path: "universities", element: <UniversityList /> },
      { path: "universities/:id", element: <UniversityDetail /> },
    ],
  },
  {
    path: "/candidate",
    element: <RoleBasedRoute allowedRoles={["candidate"]} />,
    children: [
      {
        element: <CandidateLayout />,
        children: [
          { index: true, element: <Navigate to="/candidate/dashboard" replace /> },
          { path: "dashboard", element: <CandidateDashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "universities", element: <UniversityList /> },
          { path: "universities/:id", element: <UniversityDetail /> },
          { path: "apply", element: <ApplicationForm /> },
          { path: "applications", element: <MyApplications /> },
          { path: "applications/:id", element: <CandidateApplicationDetail /> },
          { path: "notifications", element: <CandidateNotificationList /> },
          { path: "results", element: <Results /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <RoleBasedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "universities", element: <UniversityManagement /> },
          { path: "majors", element: <MajorManagement /> },
          { path: "subject-groups", element: <SubjectGroupList /> },
          { path: "admission-rounds", element: <AdmissionRoundList /> },
          { path: "candidates", element: <CandidateManagement /> },
          { path: "applications", element: <ApplicationManagement /> },
          { path: "applications/:id", element: <AdminApplicationDetail /> },
          { path: "notifications", element: <AdminNotificationList /> },
        ],
      },
    ],
  },
  {
    path: "/403",
    element: <ForbiddenPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
