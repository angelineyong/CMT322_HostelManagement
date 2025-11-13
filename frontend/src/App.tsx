import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AppRouter from "./router/AppRouter";
import { ensureDefaultAdmin } from "../utils/auth";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Ensure a default admin exists (virtual account)
useEffect(() => {
  // 1️ Read existing users
  const users = JSON.parse(localStorage.getItem("hm_users") || "[]");

  // 2️ Delete the old admin (if any).
  const filtered = users.filter((u: any) => u.role !== "admin");

  // 3️ Save the filtered user list
  localStorage.setItem("hm_users", JSON.stringify(filtered));

  // 4️ Create default admin
  ensureDefaultAdmin();
}, []);


  // Define routes that should NOT show the sidebar
  const hideSidebarRoutes = ["/", "/auth/login", "/auth/register", "/auth/register/details", "/auth/forgot"];

  // Check if current path is one of them
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {!shouldHideSidebar && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      <main
        className={`flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6 transition-all duration-300 ${
          !shouldHideSidebar ? (isSidebarOpen ? "ml-64" : "ml-20") : "ml-0"
        }`}
      >
        <AppRouter />
      </main>
    </div>
  );
}
