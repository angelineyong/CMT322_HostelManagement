import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a session (the link should log us in automatically via PKCE)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErr("Invalid or expired reset link. Please try again.");
      }
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setOkMsg("Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error: any) {
      setErr(error.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">
          Set New Password
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Enter your new password below.
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="At least 6 characters"
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
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
