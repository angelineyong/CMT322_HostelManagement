import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../../../utils/auth";
import defaultAvatar from "../../assets/userAvatar.png";

type Profile = {
  name: string;
  phone: string;
  roomNo: string;
  hostelBlock: string;
  profilePicture?: string; // base64 data URL
};

export default function StudentProfile() {
  const currentUser = getCurrentUser();

  // Guard: only student can edit profile
  const isStudent = currentUser?.role === "student";

  const storageKey = useMemo(
    () => (currentUser ? `hm_student_profile_${currentUser.id}` : ""),
    [currentUser]
  );

  const [profile, setProfile] = useState<Profile>({
    name: "",
    phone: "",
    roomNo: "",
    hostelBlock: "",
    profilePicture: undefined,
  });

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Profile;
        setProfile({
          name: parsed.name || "",
          phone: parsed.phone || "",
          roomNo: parsed.roomNo || "",
          hostelBlock: parsed.hostelBlock || "",
          profilePicture: parsed.profilePicture,
        });
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  function onFileSelected(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setProfile((p) => ({ ...p, profilePicture: base64 }));
    };
    reader.readAsDataURL(file);
  }

  function validate(): string | null {
    if (!profile.name.trim()) return "Name is required.";
    // simple phone check
    if (profile.phone && !/^[+()0-9\-\s]{6,}$/.test(profile.phone)) {
      return "Invalid phone number format.";
    }
    return null;
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setSaving(true);
    try {
      if (!storageKey) {
        setErr("No active student session.");
        setSaving(false);
        return;
      }
      localStorage.setItem(storageKey, JSON.stringify(profile));
      setOkMsg("Profile saved successfully.");
    } catch {
      setErr("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!isStudent) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
          Only student accounts can edit profile.
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
          <h1 className="text-2xl font-bold text-purple-700">User Profile</h1>
          <p className="text-gray-600 text-xs">
            Edit and save your personal information. Data is stored locally in your browser.
          </p>
        </div>
        <Link
          to="/student/"
          className="text-sm px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {err && <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">{err}</div>}
        {okMsg && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">{okMsg}</div>
        )}

        <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Avatar / Profile Picture */}
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
              <p className="text-xs text-gray-500 mt-1">
                Upload an image to update your avatar.
              </p>
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
              disabled={saving}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
