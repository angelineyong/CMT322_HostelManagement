import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/CampusFix_Logo2.png";
import userAvatar from "../assets/userAvatar.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation(); // 👈 Get current route

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, path: "/" },
    { name: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { name: "Task Assigned", icon: ClipboardList, path: "/tasks" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "User Management", icon: Users, path: "/users" },
  ];

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } relative h-screen flex flex-col justify-between transition-all duration-300`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-xl border-r border-white/30 shadow-xl"></div>

      {/* Sidebar Content */}
      <div className="relative flex flex-col h-full text-gray-800">
        {/* 🔹 Top Logo Section */}
        <div className="flex flex-col px-4 border-b border-white/30 py-4 relative">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img
              src={logo}
              alt="CampusFix Logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            {isOpen && (
              <h1 className="font-bold text-lg transition-all duration-300">
                Fixify
              </h1>
            )}
          </Link>

          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 
                       bg-white/60 hover:bg-white/80 border border-white/40 
                       rounded-full p-1 shadow-md transition-all duration-200 cursor-pointer"
          >
            {isOpen ? (
              <ChevronLeft size={18} className="text-gray-700" />
            ) : (
              <ChevronRight size={18} className="text-gray-700" />
            )}
          </button>
        </div>

        {/* 🔹 Menu Section */}
        <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {menuItems.map(({ name, icon: Icon, path }) => {
            const isActive = location.pathname === path; // 👈 Check if this item is active

            return (
              <Link
                key={name}
                to={path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-purple-200/60 text-purple-700 font-semibold shadow-inner"
                      : "hover:bg-purple-100/40 hover:text-purple-600 text-gray-700"
                  }`}
              >
                <Icon
                  size={22}
                  className={`${
                    isActive ? "text-purple-700" : "text-purple-600"
                  } transition-colors`}
                />
                {isOpen && <span className="text-sm">{name}</span>}
              </Link>
            );
          })}
          {/* 🔹 User Profile Section */}
          <div className="border-t border-gray-200 my-3"></div>

          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              isOpen ? "px-4 py-2" : "px-2 py-1 justify-center"
            }`}
          >
            <img
              src={userAvatar}
              alt="User Avatar"
              className={`rounded-full object-cover border border-white/40 transition-all duration-300 ${
                isOpen ? "w-10 h-10" : "w-8 h-8"
              }`}
            />
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  Kevin
                </span>
                <span className="text-xs text-gray-600">kevin@usm.my</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 my-3"></div>
        </div>

        {/* 🔹 Logout Button */}
        <div className="px-3 pb-5 border-t border-white/30">
          <button
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg 
                       hover:bg-red-100/40 text-red-600 transition-colors duration-200"
          >
            <LogOut size={22} />
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
