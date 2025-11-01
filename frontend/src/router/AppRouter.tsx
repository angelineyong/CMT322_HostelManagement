import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/staff/HomePage";
import TasksPage from "../pages/staff/TasksPage";
import TaskCategoryPage from "../pages/staff/task/[category]";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/staff/" element={<HomePage />} />
      <Route path="/staff/task" element={<TasksPage />} />
      <Route path="/staff/task/:category" element={<TaskCategoryPage />} />
    </Routes>
  );
}
