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
  const { isAdmin } = useAuth();

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
  const [loading, setLoading] = useState(false);

  // Fetch staff list from Supabase
  useEffect(() => {
    if (isAdmin) {
      loadStaff();
    }
  }, [isAdmin]);

  // Load staff list: join profiles + staff table
  async function loadStaff() {
    setErr(null);
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
      setErr("Failed to load staff list.");
      return;
    }

    const mapped: StaffProfile[] = (data ?? []).map((p: any) => ({
      id: p.id,
      fullName: p.full_name || "",
      email: p.email || "",
      phone: p.phone || undefined,
      position: "Staff",
      assignmentGroup: p.staff?.[0]?.assigned_group || undefined,
      status: "active",
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

  // ✅ Create staff by calling Edge Function: staff-admin
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

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("staff-admin", {
        body: {
          action: "create_staff",
          email,
          password,
          full_name: fullName,
          phone,
          assigned_group: assignmentGroup,
        },
      });

      if (error) {
        setErr(error.message);
        return;
      }

      if (!data?.ok) {
        setErr("Failed to create staff.");
        return;
      }

      setOkMsg("Staff created successfully ✅");

      // clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setPosition("");
      setAssignmentGroup("");
      setStatus("active");

      await loadStaff();
    } catch (error: any) {
      setErr(error.message ?? "Create staff failed.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Reset staff password by calling Edge Function
  async function resetPassword(staffId: string) {
    setErr(null);
    setOkMsg(null);

    const newPass = prompt("Enter new password (>=6 chars):");
    if (!newPass || newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("staff-admin", {
        body: {
          action: "reset_password",
          staff_user_id: staffId,
          new_password: newPass,
        },
      });

      if (error) {
        setErr(error.message);
        return;
      }

      setOkMsg("Password reset successfully ✅");
    } catch (err: any) {
      setErr(err.message ?? "Reset password failed.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Disable staff by calling Edge Function
  async function disableStaff(staffId: string) {
    setErr(null);
    setOkMsg(null);

    const ok = confirm("Are you sure you want to disable this staff account?");
    if (!ok) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("staff-admin", {
        body: {
          action: "disable_staff",
          staff_user_id: staffId,
        },
      });

      if (error) {
        setErr(error.message);
        return;
      }

      setOkMsg("Staff disabled successfully ✅");
    } catch (err: any) {
      setErr(err.message ?? "Disable staff failed.");
    } finally {
      setLoading(false);
    }
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
            Admin can create / reset password / disable staff accounts.
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
          Create Staff Account
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

        <form
          onSubmit={onCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=">=6 characters"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0123456789"
            />
          </div>

          {/* Assignment Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Group
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={assignmentGroup}
              onChange={(e) => setAssignmentGroup(e.target.value)}
              placeholder="e.g. A / B / Block 1"
            />
          </div>

          {/* Status (optional UI only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as StaffStatus)}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Processing..." : "Create Staff"}
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
                <th className="p-2">Actions</th>
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
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => resetPassword(s.id)}
                        disabled={loading}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-60"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => disableStaff(s.id)}
                        disabled={loading}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-60"
                      >
                        Disable
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
