import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, registerUser } from "../../../utils/auth";

type StaffStatus = "active" | "inactive";

interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status: StaffStatus;
}

const STAFF_KEY = "hm_staff_profiles";

function loadStaff(): StaffProfile[] {
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffProfile[]) : [];
  } catch {
    return [];
  }
}

function saveStaff(list: StaffProfile[]) {
  localStorage.setItem(STAFF_KEY, JSON.stringify(list));
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function UsersManagement() {
  const currentUser = getCurrentUser();

  // Guard: only admin can access
  const isAdmin = currentUser?.role === "admin";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<StaffStatus>("active");

  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    setStaffList(loadStaff());
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staffList.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.email?.toLowerCase().includes(q) ?? false) ||
        (s.position?.toLowerCase().includes(q) ?? false) ||
        (s.department?.toLowerCase().includes(q) ?? false) ||
        s.status.toLowerCase().includes(q)
    );
  }, [search, staffList]);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    if (!fullName.trim()) {
      setErr("Full Name is required.");
      return;
    }
    if (!isValidEmail(email)) {
      setErr("Invalid staff email format.");
      return;
    }
    if ((password ?? "").length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    const exists = staffList.some((s) => s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setErr("A staff with this email already exists.");
      return;
    }

    // Create login account for staff
    const reg = registerUser({ email: email.trim(), password: password.trim(), role: "staff" });
    if (!reg.ok) {
      setErr(reg.error);
      return;
    }

    const profile: StaffProfile = {
      id: genId(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      position: position.trim() || undefined,
      department: department.trim() || undefined,
      status,
    };

    const next = [...staffList, profile];
    setStaffList(next);
    saveStaff(next);
    setOkMsg("Staff profile and login account created.");
    setFullName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setPosition("");
    setDepartment("");
    setStatus("active");
  }

  function remove(id: string) {
    const next = staffList.filter((s) => s.id !== id);
    setStaffList(next);
    saveStaff(next);
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
          Only admin accounts can access Staff Profile Management.
        </div>
        <Link className="text-purple-700 underline" to="/auth/login">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Staff Profile Management</h1>
          <p className="text-gray-600 text-xs">
            Create and manage staff profiles. Data is stored locally in your browser.
          </p>
        </div>
        <Link
          to="/admin/dashboard"
          className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-md font-semibold text-purple-700 mb-4">Create Staff Profile</h2>

        {err && <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">{err}</div>}
        {okMsg && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">{okMsg}</div>
        )}

        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="staff@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Set a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+60 1X-XXXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Technician"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Maintenance"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={status}
              onChange={(e) => setStatus(e.target.value as StaffStatus)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-semibold text-purple-700">Staff List</h2>
          <input
            type="text"
            placeholder="Search name, email, position..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full border border-gray-200 rounded-lg text-left text-xs">
            <thead>
              <tr className="bg-purple-100">
                <th className="p-2">Full Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Position</th>
                <th className="p-2">Department</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={7}>
                    No staff profiles yet.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-t border-gray-200">
                    <td className="p-2">{s.fullName}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.phone || "-"}</td>
                    <td className="p-2">{s.position || "-"}</td>
                    <td className="p-2">{s.department || "-"}</td>
                    <td className="p-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-lg font-semibold ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => remove(s.id)}
                        className="text-red-600 hover:text-red-700 underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
