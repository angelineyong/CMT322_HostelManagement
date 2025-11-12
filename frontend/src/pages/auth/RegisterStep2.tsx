import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/userAvatar.png";
import { registerUser, login } from "../../../utils/auth";

type ProfileDraft = {
  name: string;
  phone: string;
  roomNo: string;
  hostelBlock: string;
  profilePicture?: string; // base64
};

export default function RegisterStep2() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileDraft>({
    name: "",
    phone: "",
    roomNo: "",
    hostelBlock: "",
    profilePicture: undefined,
  });

  useEffect(() => {
    // Load draft from Step 1
    try {
      const raw = sessionStorage.getItem("hm_register_draft");
      if (!raw) return;
      const draft = JSON.parse(raw) as { email: string; password: string };
      setEmail(draft.email);
      setPassword(draft.password);
    } catch {
      // ignore
    }
  }, []);

  function onFileSelected(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfile((p) => ({ ...p, profilePicture: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function validate(): string | null {
    if (!email) return "Missing email from Step 1. Please go back.";
    if (!password) return "Missing password from Step 1. Please go back.";
    if (!profile.name.trim()) return "Name is required.";
    if (profile.phone && !/^[+()0-9\-\s]{6,}$/.test(profile.phone)) {
      return "Invalid phone number format.";
    }
    return null;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);
    // Compose address to satisfy student requirement
    const address = `Block ${profile.hostelBlock || "-"}, Room ${profile.roomNo || "-"}`;

    const res = registerUser({
      email,
      password,
      role: "student",
      address,
    });

    if (!res.ok) {
      setSaving(false);
      setErr(res.error);
      return;
    }

    // Save the student's profile under the created user id
    try {
      const key = `hm_student_profile_${res.user.id}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          roomNo: profile.roomNo.trim(),
          hostelBlock: profile.hostelBlock.trim(),
          profilePicture: profile.profilePicture,
        })
      );
    } catch {
      // ignore save error
    }

    // Auto-login after registration for a smooth experience
    const loginRes = login(email, password);
    if (!loginRes.ok) {
      setSaving(false);
      setErr("Account created, but auto-login failed. Please login manually.");
      return;
    }

    setSaving(false);
    setOkMsg("Registration complete. Redirecting to your dashboard...");
    // Clear draft
    try {
      sessionStorage.removeItem("hm_register_draft");
    } catch { /* ignore */ }

    setTimeout(() => navigate("/student/"), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">Create Account</h1>
        <p className="text-gray-600 text-sm mb-6">Step 2 of 2 — Personal details</p>

        {err && <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">{err}</div>}
        {okMsg && <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">{okMsg}</div>}

        {!email && (
          <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded-lg mb-4">
            Missing email/password from Step 1. Please go back to Step 1.
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Avatar */}
          <div className="md:col-span-2 flex items-center gap-4">
            <img
              src={profile.profilePicture || defaultAvatar}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                className="text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileSelected(f);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Upload an image to update your avatar.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Kevin Tan"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+60 1X-XXXX XXXX"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room No.</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., A-12-05"
              value={profile.roomNo}
              onChange={(e) => setProfile((p) => ({ ...p, roomNo: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Block</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Block A"
              value={profile.hostelBlock}
              onChange={(e) => setProfile((p) => ({ ...p, hostelBlock: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving || !email}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {saving ? "Submitting..." : "Complete Registration"}
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center text-sm mt-4">
          <Link className="text-purple-700 hover:underline" to="/auth/register">
            Back to Step 1
          </Link>
          <Link className="text-purple-700 hover:underline" to="/auth/login">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
