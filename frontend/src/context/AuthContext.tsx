import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  profile_pic_url: string | null;
  role: "student" | "staff" | "admin";
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  studentData: { room_no: string | null; hostel_block: string | null } | null;
  staffData: { assigned_group: string | null } | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentData, setStudentData] = useState<{
    room_no: string | null;
    hostel_block: string | null;
  } | null>(null);
  const [staffData, setStaffData] = useState<{
    assigned_group: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setStudentData(null);
        setStaffData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      // Fetch base profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch role-specific data using the FK relationship if possible,
      // or just separate queries since we have separate tables.
      if (profileData.role === "student") {
        const { data: sData } = await supabase
          .from("students")
          .select("room_no, hostel_block")
          .eq("id", userId)
          .single();
        setStudentData(sData);
        setStaffData(null);
      } else if (profileData.role === "staff") {
        const { data: stData } = await supabase
          .from("staff")
          .select("assigned_group")
          .eq("id", userId)
          .single();
        setStaffData(stData);
        setStudentData(null);
      } else {
        setStudentData(null);
        setStaffData(null);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setStudentData(null);
    setStaffData(null);
  };

  const value = {
    session,
    user,
    profile,
    studentData,
    staffData,
    loading,
    isAdmin: profile?.role === "admin",
    isStaff: profile?.role === "staff",
    isStudent: profile?.role === "student",
    refreshProfile: async () => {
      if (user) await fetchProfile(user.id);
    },
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
