"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { fetchAPI } from "@/lib/api";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from "@/firebase";

type Mode = "user" | "admin";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode]           = useState<Mode>("user");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const saveAuth = (token: string, user: object, isAdmin: boolean) => {
    localStorage.setItem(isAdmin ? "adminToken" : "token", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    window.dispatchEvent(new Event("authChange"));
  };

  // ── Firebase social login (user only) ───────────────────────
  const socialLogin = async (provider: "google" | "facebook") => {
    setLoading(true);
    setError("");
    try {
      const p = provider === "google" ? new GoogleAuthProvider() : new FacebookAuthProvider();
      const result = await signInWithPopup(auth, p);
      const idToken = await result.user.getIdToken();

      const data = await fetchAPI("/auth/firebase-login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });

      saveAuth(data.token, data.user, false);
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Social login failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Admin email/password login ───────────────────────────────
  const adminLogin = async () => {
  setLoading(true);
  setError("");
  try {
    const data = await fetchAPI("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    saveAuth(data.token, data.user, true);
    router.push("/admin/admin-dashboard");
  } catch (e: unknown) {
    // Show the real error from backend instead of generic message
    setError(e instanceof Error ? e.message : "Invalid admin credentials.");
  } finally {
    setLoading(false);
  }
};

  // ── User email/password login (via Firebase) ─────────────────
  const userEmailLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      const data = await fetchAPI("/auth/firebase-login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });

      saveAuth(data.token, data.user, false);
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    mode === "admin" ? adminLogin() : userEmailLogin();
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">

        {/* Card */}
        <div className="bg-dark-800 border border-dark-600 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-dark-700">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform glow-brand">
                <Zap size={22} className="text-white" fill="white" />
              </div>
              <div className="leading-tight text-left">
                <span className="font-heading font-bold text-lg text-white block leading-none">Subscriptions</span>
                <span className="text-brand-400 text-xs font-medium">BD</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white font-heading">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="px-8 py-6 space-y-5">

            {/* Mode toggle */}
            <div className="flex bg-dark-900 rounded-xl p-1 gap-1">
              {(["user", "admin"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                    mode === m
                      ? "bg-brand-500 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m === "admin" ? "🔐 Admin" : "👤 User"}
                </button>
              ))}
            </div>

            {/* Social login — user only */}
            {mode === "user" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <button
                    onClick={() => socialLogin("google")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-slate-500 text-slate-200 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  {/* Facebook */}
                  <button
                    onClick={() => socialLogin("facebook")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-500 hover:border-blue-500/50 text-slate-200 text-sm font-medium transition-all disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-dark-600" />
                  <span className="text-xs text-slate-500">or continue with email</span>
                  <div className="flex-1 h-px bg-dark-600" />
                </div>
              </>
            )}

            {/* Email + Password */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={mode === "admin" ? "admin@example.com" : "you@example.com"}
                    className="w-full bg-dark-900 border border-dark-500 focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="••••••••"
                    className="w-full bg-dark-900 border border-dark-500 focus:border-brand-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950/50 border border-red-700/50 text-red-400 text-sm px-4 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                mode === "admin" ? "Sign in as Admin" : "Sign in"
              )}
            </button>

            {/* Sign up link — user only */}
            {mode === "user" && (
              <p className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © {new Date().getFullYear()} Subscriptions BD. All rights reserved.
        </p>
      </div>
    </div>
  );
}