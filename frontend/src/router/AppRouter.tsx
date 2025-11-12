import { Routes, Route, useParams, useNavigate } from "react-router-dom";
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
import ForgotPassword from "../pages/auth/ForgotPassword";
import StudentProfile from "../pages/student/StudentProfile";
import RegisterStep1 from "../pages/auth/RegisterStep1";
import RegisterStep2 from "../pages/auth/RegisterStep2";

function ComplaintDetailRouteWrapper() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  return (
    <ComplaintDetail
      complaintId={complaintId ?? null}
      onClose={() => navigate(-1)}
    />
  );
}

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
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/complaint" element={<CreateComplaint />} />
      <Route path="/student/track" element={<TrackComplaint />} />
      <Route path="/complaint/:complaintId" element={<ComplaintDetailRouteWrapper />} />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<RegisterStep1 />} />
      <Route path="/auth/register/details" element={<RegisterStep2 />} />
      <Route path="/auth/forgot" element={<ForgotPassword />} />
    </Routes>
  );
}
