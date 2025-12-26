import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import defaultAvatar from "../../assets/userAvatar.png";

type ProfileView = {
  name: string;
  phone: string;
  roomNo: string;
  hostelBlock: string;
  profilePicture?: string;
};

export default function StudentProfile() {
  const {
    user,
    profile: authProfile,
    studentData,
    isStudent,
    refreshProfile,
  } = useAuth();

  const [profile, setProfile] = useState<ProfileView>({
    name: "",
    phone: "",
    roomNo: "",
    hostelBlock: "",
    profilePicture: undefined,
  });

  const [contactErr, setContactErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize from context on load
  useEffect(() => {
    if (authProfile && studentData) {
      setProfile({
        name: authProfile.full_name || "",
        phone: authProfile.phone || "",
        roomNo: studentData.room_no || "",
        hostelBlock: studentData.hostel_block || "",
        profilePicture: authProfile.profile_pic_url || undefined,
      });
    }
  }, [authProfile, studentData]);

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
    if (!profile.name.trim()) return "Name is required.";
    if (profile.phone && !/^[+()0-9\-\s]{6,}$/.test(profile.phone)) {
      return "Invalid phone number format.";
    }
    return null;
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setContactErr(null);
    setOkMsg(null);

    const v = validate();
    if (v) {
      setContactErr(v);
      return;
    }

    if (!user) {
      setContactErr("No active session.");
      return;
    }

    setSaving(true);
    try {
      // 1. Upload Avatar if strictly new file selected
      let profile_pic_url = authProfile?.profile_pic_url;
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile);

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          profile_pic_url = publicData.publicUrl;
        }
      }

      // 2. Update Profiles Table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.name.trim(),
          phone: profile.phone.trim(),
          profile_pic_url,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 3. Update Students Table
      const { error: studentError } = await supabase
        .from("students")
        .update({
          room_no: profile.roomNo.trim(),
          hostel_block: profile.hostelBlock.trim(),
        })
        .eq("id", user.id);

      if (studentError) throw studentError;

      // 4. Force context refresh
      await refreshProfile();
      setOkMsg("Profile saved successfully.");
    } catch (err: any) {
      console.error(err);
      setContactErr(err.message || "Failed to save profile.");
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
            Edit and save your personal information.
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
        {contactErr && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {contactErr}
          </div>
        )}
        {okMsg && (
          <div className="bg-green-100 text-green-700 text-sm p-3 rounded-lg mb-4">
            {okMsg}
          </div>
        )}

        <form
          onSubmit={onSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
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
              placeholder="+60 1X-XXXX XXXX"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room No.
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., A-12-05"
              value={profile.roomNo}
              onChange={(e) =>
                setProfile((p) => ({ ...p, roomNo: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostel Block
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Block A"
              value={profile.hostelBlock}
              onChange={(e) =>
                setProfile((p) => ({ ...p, hostelBlock: e.target.value }))
              }
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
