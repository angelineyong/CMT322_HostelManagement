import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function RegisterStep1() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const onNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!email || !password) {
      setErr("Please fill in all fields.");
      return;
    }

    // Email Validation: @student.usm.my or @gmail.com
    const emailRegex = /^[^\s@]+@(student\.usm\.my|gmail\.com)$/;
    if (!emailRegex.test(email)) {
      setErr("Email must be @student.usm.my or @gmail.com");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setChecking(true);
    try {
      // Check if email already exists via RPC
      const { data: exists, error } = await supabase.rpc("check_email_exists", {
        email_to_check: email,
      });

      if (error) {
        console.error("Error checking email:", error);
        // Fallback: If RPC fails (maybe not created yet), just proceed and let Step 2 handle it
      } else if (exists) {
        setErr("This email is already registered. Please login.");
        setChecking(false);
        return;
      }

      // Stash draft in sessionStorage for Step 2
      sessionStorage.setItem(
        "hm_register_draft",
        JSON.stringify({ email: email.trim(), password })
      );
      navigate("/auth/register/details");
    } catch (err) {
      console.error(err);
      // Proceed if check fails to avoid blocking user due to network/config issues
      navigate("/auth/register/details");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">
          Create Account
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Step 1 of 2 — Enter your email and password
        </p>

        {err && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">
            {err}
          </div>
        )}

        <form onSubmit={onNext} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={checking}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:bg-purple-400"
          >
            {checking ? "Checking..." : "Continue"}
          </button>
        </form>

        <div className="flex justify-between items-center text-sm mt-4">
          <Link className="text-purple-700 hover:underline" to="/auth/login">
            Already have an account? Login
          </Link>
          <Link className="text-purple-700 hover:underline" to="/auth/forgot">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
