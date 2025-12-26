import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

type StaffStatus = "active" | "inactive";

interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
  assignmentGroup?: string;
  status: StaffStatus;
}

export default function UsersManagement() {
  const { profile, isAdmin } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [assignmentGroup, setAssignmentGroup] = useState("");
  const [status, setStatus] = useState<StaffStatus>("active");

  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Fetch staff list from Supabase
  useEffect(() => {
    if (isAdmin) {
      loadStaff();
    }
  }, [isAdmin]);

  async function loadStaff() {
    // Join profiles and staff table to get full details
    // For simplicity, fetching from profiles where role is staff
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        role,
        staff(assigned_group)
      `
      )
      .eq("role", "staff");

    if (error) {
      console.error("Error loading staff:", error);
      return;
    }

    // Map to StaffProfile interface
    const mapped: StaffProfile[] = data.map((p: any) => ({
      id: p.id,
      fullName: p.full_name || "",
      email: p.email || "",
      phone: p.phone || undefined,
      position: "Staff", // generic
      assignmentGroup: p.staff?.[0]?.assigned_group || undefined,
      status: "active", // Supabase doesn't have status yet, assume active
    }));
    setStaffList(mapped);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staffList.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.email?.toLowerCase().includes(q) ?? false) ||
        (s.position?.toLowerCase().includes(q) ?? false) ||
        (s.assignmentGroup?.toLowerCase().includes(q) ?? false) ||
        s.status.toLowerCase().includes(q)
    );
  }, [search, staffList]);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function onCreate(e: React.FormEvent) {
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

    try {
      // Create staff user in Supabase
      // Note: Creating a user with a specific role usually requires Admin Auth Client (service_role)
      // or a specific Edge Function if we are client-side.
      // For this demo, we can try signUp but it logs in the new user immediately which disrupts the admin session.
      // The proper way is using supabase.auth.admin.createUser() but that needs service_role key which is backend only.

      // WORKAROUND for Demo: We will use a second (temporary) client or valid backend logic.
      // Given constraints, we'll simulating "Creating" by asking them to sign up, OR
      // we accept that we can't easily create another user without logging out.

      // Let's assume for now we just want to stub this or use a workaround.
      // Option: Send an invite? Supabase supports inviteUserByEmail but typically backend only.

      setErr(
        "Admin creating other users requires backend integration. In this client-only demo, please ask staff to register themselves via the /auth/register page."
      );
      return;

      /* 
        // Real implementation would be calls to a Supabase Edge Function:
        const { data, error } = await supabase.functions.invoke('create-user', { 
            body: { email, password, role: 'staff', full_name: fullName, ... } 
        })
        */
    } catch (error: any) {
      setErr(error.message);
    }
  }

  function remove(id: string) {
    // Same limitation: Admin cannot easily delete other users client-side without service role.
    setErr("Deleting users requires backend integration.");
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
          <h1 className="text-2xl font-bold text-purple-700">
            Staff Profile Management
          </h1>
          <p className="text-gray-600 text-xs">
            Manage staff profiles. (Note: Creation disabled in client-only mode)
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
        <h2 className="text-md font-semibold text-purple-700 mb-4">
          Create Staff Profile
        </h2>

        {err && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {err}
          </div>
        )}
        {okMsg && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
            {okMsg}
          </div>
        )}

        <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4 text-sm">
          To add new staff, please have them register via the public
          registration page using a specific Staff code or manually update their
          role in the database after registration.
        </div>

        <form
          onSubmit={onCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none"
        >
          {/* ... inputs kept for UI visual but disabled ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={fullName}
              readOnly
            />
          </div>
          {/* ... other inputs ... */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled
              className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg"
            >
              Create (Disabled)
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
            placeholder="Search name, email..."
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
                <th className="p-2">Assignment Group</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={6}>
                    No staff profiles found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-t border-gray-200">
                    <td className="p-2">{s.fullName}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.phone || "-"}</td>
                    <td className="p-2">{s.assignmentGroup || "-"}</td>
                    <td className="p-2">
                      <span className="inline-block px-2 py-1 rounded-lg font-semibold bg-green-100 text-green-700">
                        {s.status}
                      </span>
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
