import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/staff/HomePage";
import TasksPage from "../pages/staff/TasksPage";
import TaskCategoryPage from "../pages/staff/task/[category]";
import TaskDetailPage from "../pages/staff/task/[id]";
import PerformanceInsightsPage from "../pages/staff/PerformanceInsightsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import StudentHome from "../pages/student/StudentHome";
import CreateComplaint from "../pages/student/CreateComplaint";
import TrackComplaint from "../pages/student/TrackComplaint";
import ComplaintDetail from "../pages/student/ComplaintDetail";
import UsersManagement from "../pages/admin/UsersManagement";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/staff/" element={<HomePage />} />
      <Route path="/staff/task" element={<TasksPage />} />
      <Route path="/staff/task/:category" element={<TaskCategoryPage />} />
      <Route path="/staff/task/:category/:id" element={<TaskDetailPage />} />
      <Route path="/staff/performance" element={<PerformanceInsightsPage />} />

      <Route path="/admin/dashboard" element={<DashboardPage />} />
      <Route path="/admin/userManagement" element={<UsersManagement />} />

      <Route path="/student" element={<StudentHome />} />
      <Route path="/student/complaint" element={<CreateComplaint />} />
      <Route path="/student/track" element={<TrackComplaint />} />
      <Route path="/complaint/:complaintId" element={<ComplaintDetail />} />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot" element={<ForgotPassword />} />
    </Routes>
  );
}
