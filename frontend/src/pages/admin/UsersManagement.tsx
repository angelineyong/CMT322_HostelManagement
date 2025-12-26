import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";

interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  assignmentGroup?: string;
  profilePic?: string;
}

export default function UsersManagement() {
  const { isAdmin } = useAuth(); // removed unused vars

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [assignmentGroup, setAssignmentGroup] = useState("");
  const [groups, setGroups] = useState<string[]>([]); // New state for groups
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch staff list and groups
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadStaff(), loadGroups()]);
    setLoading(false);
  }

  async function loadGroups() {
    const { data, error } = await supabase
      .from("assignment_groups")
      .select("name")
      .order("name");

    if (error) {
      console.error("Error loading groups:", error);
    } else if (data) {
      setGroups(data.map((g: any) => g.name));
    }
  }

  async function loadStaff() {
    // Fetch profiles where role is 'staff'
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        role,
        profile_pic_url,
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
      assignmentGroup: Array.isArray(p.staff)
        ? p.staff[0]?.assigned_group
        : p.staff?.assigned_group,
      profilePic: p.profile_pic_url,
    }));
    setStaffList(mapped);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staffList.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        (s.email?.toLowerCase().includes(q) ?? false) ||
        (s.assignmentGroup?.toLowerCase().includes(q) ?? false)
    );
  }, [search, staffList]);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function onFileSelected(file: File) {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    // Basic Validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !phone.trim() ||
      !assignmentGroup.trim() ||
      !selectedFile
    ) {
      setErr("All fields are required, including the Profile Picture.");
      return;
    }
    if (!isValidEmail(email)) {
      setErr("Invalid staff email format.");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create a temporary Supabase client to avoid logging out the Admin
      // We use the same URL and Key, but with persistence disabled.
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { createClient } = await import("@supabase/supabase-js");
      const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false, // Critical: Don't store this session
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      // 2. Sign Up the Staff User
      const { data: authData, error: authError } = await tempClient.auth.signUp(
        {
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: "staff", // Trigger will see this and create public.staff entry
            },
          },
        }
      );

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user object.");

      const newUserId = authData.user.id;
      let profile_pic_url = null;

      // 3. Upload Image (using Admin client, which has permission)
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        // Save under the new user's specific folder
        const filePath = `${newUserId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile);

        if (uploadError)
          throw new Error("Failed to upload image: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        profile_pic_url = publicUrlData.publicUrl;
      }

      // 4. Update the created Profile and Staff entries
      // The trigger 'handle_new_user' should have already created the rows.
      // We update them with the extra info (phone, pic, assignment).
      // Note: Admin should have RLS permissions to update 'profiles' and 'staff'.

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: phone.trim(),
          profile_pic_url: profile_pic_url,
        })
        .eq("id", newUserId);

      if (profileError)
        throw new Error("Profile update failed: " + profileError.message);

      const { error: staffError } = await supabase
        .from("staff")
        .update({
          assigned_group: assignmentGroup.trim(),
        })
        .eq("id", newUserId);

      if (staffError)
        throw new Error("Staff details update failed: " + staffError.message);

      setOkMsg("Staff account created! Verification email has been sent.");

      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setAssignmentGroup("");
      setSelectedFile(null);
      setPreview(null);

      // Reload list
      loadData();
    } catch (error: any) {
      console.error("Staff Creation Error:", error);
      setErr(error.message || "Failed to create staff account.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this staff member? This cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_user_by_admin", {
        user_id_to_delete: id,
      });
      if (error) throw error;

      setOkMsg("Staff user deleted successfully.");
      loadStaff();
    } catch (error: any) {
      console.error(error);
      setErr(
        error.message || "Failed to delete user. Ensure you have permission."
      );
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
            Create, view, and manage staff accounts.
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

        <form
          onSubmit={onCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Row 1: Profile Picture (Centered, Full Width) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
            <label className="block text-sm font-bold text-purple-700 mb-3">
              Profile Picture <span className="text-red-500">*</span>
            </label>
            <div className="relative group cursor-pointer">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-gray-400 border-2 border-gray-200 shadow-sm">
                  <span className="text-sm font-medium">Upload Photo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileSelected(f);
                }}
                required={!selectedFile} // HTML5 validation if supported, otherwise manual check
              />
              <div className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click to upload. Required.
            </p>
          </div>

          {/* Row 2: Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Staff Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="staff@usm.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Row 3: Security & Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 0123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Row 4: Job Info */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Group <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={assignmentGroup}
              onChange={(e) => setAssignmentGroup(e.target.value)}
              required
            >
              <option value="">Select Group...</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:bg-purple-400 disabled:scale-100 shadow-md"
            >
              {loading ? "Creating..." : "Create Staff Account"}
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
            placeholder="Search..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full border border-gray-200 rounded-lg text-left text-xs">
            <thead>
              <tr className="bg-purple-100 uppercase text-purple-700 font-semibold">
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Assignment Group</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={5}>
                    No staff profiles found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        {s.profilePic ? (
                          <img
                            src={s.profilePic}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200" />
                        )}
                        {s.fullName}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{s.email}</td>
                    <td className="p-3 text-gray-600">{s.phone || "-"}</td>
                    <td className="p-3 text-gray-600">
                      {s.assignmentGroup || "-"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => remove(s.id)}
                        className="text-red-500 hover:text-red-700 hover:underline px-2 py-1 rounded"
                      >
                        Delete
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
