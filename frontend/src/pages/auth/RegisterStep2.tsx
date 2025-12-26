import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/userAvatar.png";
import { supabase } from "../../lib/supabaseClient";

type ProfileDraft = {
  name: string;
  phone: string;
  roomNo: string;
  hostelBlock: string;
  profilePicture?: string; // base64 for preview
};

type Hostel = {
  id: string;
  name: string;
};

export default function RegisterStep2() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loadingHostels, setLoadingHostels] = useState(true);

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

    // Fetch Hostels
    fetchHostels();
  }, []);

  async function fetchHostels() {
    try {
      const { data, error } = await supabase
        .from("hostels")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setHostels(data || []);
    } catch (error) {
      console.error("Error fetching hostels:", error);
    } finally {
      setLoadingHostels(false);
    }
  }

  function onFileSelected(file: File) {
    setSelectedFile(file);
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

    // Phone validation: Required, 10 or more digits
    if (!profile.phone.trim()) return "Phone Number is required.";
    const phoneDigits = profile.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return "Phone number must have at least 10 digits.";
    }

    // Room No Validation: 6-01A (Num-NumNumAlphabet)
    // Regex: ^\d+-\d{2}[A-Za-z]$
    const roomRegex = /^\d+-\d{2}[A-Za-z]$/;
    if (!profile.roomNo.trim()) return "Room No. is required.";
    if (!roomRegex.test(profile.roomNo.trim())) {
      return "Invalid Room No. format. Expected format: 6-01A (e.g. Level-RoomnumberAlphabet)";
    }

    if (!profile.hostelBlock) return "Please select a Hostel Block.";

    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
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
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile.name.trim(),
            role: "student",
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed.");

      const userId = authData.user.id;

      // 2. Upload Avatar (if selected)
      let profile_pic_url = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          profile_pic_url = publicUrlData.publicUrl;
        }
      }

      // 3. Update Profile
      // Note: "profiles" row is created by trigger, so we update it.
      // RLS is disabled so we can do this even if session is pending confirmation.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          phone: profile.phone.trim(),
          profile_pic_url,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // 4. Update Student Data
      // "students" row is created by trigger.
      const { error: studentError } = await supabase
        .from("students")
        .update({
          room_no: profile.roomNo.trim(),
          hostel_block: profile.hostelBlock, // Selected from dropdown
        })
        .eq("id", userId);

      if (studentError) throw studentError;

      // 5. Success
      setOkMsg("Registration complete! Redirecting...");
      try {
        sessionStorage.removeItem("hm_register_draft");
      } catch {
        /* ignore */
      }

      // Check if session established (auto-login)
      if (authData.session) {
        setTimeout(() => navigate("/student/"), 1000);
      } else {
        setOkMsg(
          "Registration successful! Please check your email to confirm your account."
        );
        setSaving(false);
      }
    } catch (error: any) {
      console.error(error);
      setErr(error.message || "An error occurred during registration.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Step 2 of 2 — Personal details
        </p>

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

        {!email && (
          <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded-lg mb-4">
            Missing email/password from Step 1. Please go back to Step 1.
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
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
              <p className="text-xs text-gray-500 mt-1">
                Upload an image to update your avatar.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Kevin Tan"
              value={profile.name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 01XXXXXXXX"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room No.
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 6-01A"
              value={profile.roomNo}
              onChange={(e) =>
                setProfile((p) => ({ ...p, roomNo: e.target.value }))
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 6-01A (Level-NumNumAlphabet)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostel Block
            </label>
            {loadingHostels ? (
              <div className="text-sm text-gray-500">Loading hostels...</div>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={profile.hostelBlock}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, hostelBlock: e.target.value }))
                }
                required
              >
                <option value="">Select Hostel Block</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            )}
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
