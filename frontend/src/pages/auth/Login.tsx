import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch role to determine redirect
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          // Fallback or error
          console.error(profileError);
          navigate("/student/"); // Default fallback
        } else {
          if (profile.role === "admin") {
            navigate("/admin/dashboard");
          } else if (profile.role === "staff") {
            navigate("/staff/");
          } else {
            navigate("/student/");
          }
        }
      }
    } catch (err: any) {
      setErr(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-sm mb-6">Login to your account</p>

        {err && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="any *.usm.my subdomains"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between items-center text-sm mt-4">
          <Link className="text-purple-700 hover:underline" to="/auth/forgot">
            Forgot Password?
          </Link>
          <Link className="text-purple-700 hover:underline" to="/auth/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
