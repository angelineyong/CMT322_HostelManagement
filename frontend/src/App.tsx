import { useState } from "react";
import Sidebar from "./components/Sidebar";
import AppRouter from "./router/AppRouter";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main
        className={`flex-1 overflow-y-auto min-h-screen bg-gray-50 p-6 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <AppRouter />
      </main>
    </div>
  );
}
