import {
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
  House,
  BadgeAlert,
  ClipboardClock,
  Menu,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/CampusFix_Logo2.png";
import defaultAvatar from "../assets/userAvatar.png";

// Define prop types for Sidebar
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth(); // Use AuthContext

  // Close sidebar on route change (Mobile only)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    handleResize();
  }, [location.pathname, setIsOpen]);

  // Load student profile if available
  let displayName = "User";
  const displayEmail = user?.email ?? "unknown@domain";
  let profileImage = profile?.profile_pic_url || defaultAvatar;

  if (profile?.full_name) {
    displayName = profile.full_name;
  } else if (profile?.role === "student") {
    displayName = "Student";
  } else if (profile?.role === "staff") {
    displayName = "Staff";
  } else if (profile?.role === "admin") {
    displayName = "Admin";
  }

  const allMenuItems = [
    // Staff area
    { name: "Overview", icon: LayoutDashboard, path: "/staff/" },
    { name: "Task Assigned", icon: ClipboardList, path: "/staff/task" },
    {
      name: "Performance Insights",
      icon: MessageSquare,
      path: "/staff/performance",
    },

    // Admin area
    { name: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
    { name: "User Management", icon: Users, path: "/admin/userManagement" },

    // Student area
    { name: "Home", icon: House, path: "/student/" },
    { name: "Create Complaint", icon: BadgeAlert, path: "/student/complaint" },
    { name: "Track Complaint", icon: ClipboardClock, path: "/student/track" },
  ];

  // Role-based visibility filters
  const allowedPathsByRole: Record<string, string[]> = {
    admin: ["/admin/dashboard", "/admin/userManagement"],
    staff: ["/staff/", "/staff/task", "/staff/performance"],
    student: ["/student/", "/student/complaint", "/student/track"],
  };
  const allowedPaths = profile ? allowedPathsByRole[profile.role] ?? [] : [];

  const menuItems = allMenuItems.filter((item) =>
    allowedPaths.includes(item.path)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`${
          isOpen
            ? "w-64 h-screen top-0 left-0 rounded-none bg-white/30"
            : "w-12 h-12 top-4 left-4 rounded-full md:w-20 md:h-screen md:top-0 md:left-0 md:rounded-none md:bg-white/30"
        } fixed flex flex-col justify-between transition-all duration-300 z-50 backdrop-blur-xl border-r border-white/30 shadow-xl overflow-hidden`}
      >
        {/* Mobile Floating Trigger (Visible only when closed on mobile) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="md:hidden flex items-center justify-center w-full h-full cursor-pointer bg-white/60 hover:bg-white/80 transition-colors"
          >
            <Menu size={24} className="text-gray-800" />
          </div>
        )}

        {/* Sidebar Content (Hidden on mobile when closed) */}
        <div
          className={`flex flex-col h-full text-gray-800 ${
            isOpen ? "flex opacity-100" : "hidden md:flex md:opacity-100"
          } transition-opacity duration-300`}
        >
          {/* 🔹 Top Logo Section */}
          <div className="flex flex-col px-4 border-b border-white/30 py-4 relative">
            <Link
              to={
                profile
                  ? profile.role === "admin"
                    ? "/admin/dashboard"
                    : profile.role === "staff"
                    ? "/staff/"
                    : "/student/"
                  : "/auth/login"
              }
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
              onClick={() => setIsOpen((prev: boolean) => !prev)}
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
              const isActive =
                path === "/staff/" || path === "/student/"
                  ? location.pathname === path
                  : location.pathname.startsWith(path);

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

            <div className="border-t border-gray-200 my-3"></div>

            {/* Students can edit their profile pictures by clicking on /student/profile; other roles only display information. */}
            {profile?.role === "student" ? (
              // Note: Variable currentUser is replaced by profile in previous edits, so we need to match carefully or fix this.
              // Ah, I renamed 'currentUser' logic section but 'currentUser' is used here.
              // I should replace 'currentUser?.role' with 'profile?.role'.
              <Link
                to="/student/profile"
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isOpen ? "px-4 py-2" : "px-2 py-1 justify-center"
                } hover:bg-purple-100/40 rounded-lg`}
                title="Edit profile"
              >
                <img
                  src={profileImage}
                  alt="User Avatar"
                  className={`rounded-full object-cover border border-white/40 transition-all duration-300 ${
                    isOpen ? "w-10 h-10" : "w-8 h-8"
                  }`}
                />
                {isOpen && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {displayName}
                    </span>
                    <span className="text-xs text-gray-600">
                      {displayEmail}
                    </span>
                  </div>
                )}
              </Link>
            ) : (
              <div
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isOpen ? "px-4 py-2" : "px-2 py-1 justify-center"
                }`}
              >
                <img
                  src={profileImage}
                  alt="User Avatar"
                  className={`rounded-full object-cover border border-white/40 transition-all duration-300 ${
                    isOpen ? "w-10 h-10" : "w-8 h-8"
                  }`}
                />
                {isOpen && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {displayName}
                    </span>
                    <span className="text-xs text-gray-600">
                      {displayEmail}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 my-3"></div>
          </div>

          {/* 🔹 Logout Button */}
          <div className="px-3 pb-5 border-t border-white/30">
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg 
                       hover:bg-red-100/40 text-red-600 transition-colors duration-200"
            >
              <LogOut size={22} />
              {isOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
