import Sidebar from "./components/Sidebar";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="grow py-4 px-6">
        <AppRouter />
      </main>
    </div>
  );
}
