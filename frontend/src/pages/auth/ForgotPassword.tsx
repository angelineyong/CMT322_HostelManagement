import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setOkMsg("Password reset link sent to your email.");
    } catch (error: any) {
      setErr(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Enter your registered email and a new password.
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="flex justify-between items-center text-sm mt-4">
          <Link className="text-purple-700 hover:underline" to="/auth/login">
            Back to Login
          </Link>
          <Link className="text-purple-700 hover:underline" to="/auth/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
