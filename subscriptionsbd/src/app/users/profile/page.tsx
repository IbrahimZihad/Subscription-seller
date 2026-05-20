"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  payment_phone: string;
  avatar: string;
  role: string;
  provider: string;
  is_email_verified: boolean;
  is_active: boolean;
  last_login_at: string;
  createdAt: string;
}

interface OrderItem {
  product_name: string;
  plan_name: string;
  quantity: number;
}

interface Order {
  id: number;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  createdAt: string;
  order_items?: OrderItem[];
}

type Tab = "profile" | "orders" | "security";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-400/10 text-amber-400 border-amber-400/30",
  paid:       "bg-blue-400/10 text-blue-400 border-blue-400/30",
  processing: "bg-purple-400/10 text-purple-400 border-purple-400/30",
  delivered:  "bg-teal-400/10 text-teal-400 border-teal-400/30",
  completed:  "bg-green-400/10 text-green-400 border-green-400/30",
  cancelled:  "bg-red-400/10 text-red-400 border-red-400/30",
  refunded:   "bg-slate-400/10 text-slate-400 border-slate-400/30",
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") ?? "";
}

export default function UserProfilePage() {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [orders, setOrders]   = useState<Order[]>([]);
  const [tab, setTab]         = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState({ msg: "", type: "success" });

  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", payment_phone: "", avatar: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    Promise.all([
      fetchAPI("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetchAPI("/orders",  { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([u, o]) => {
        const userData = u.data ?? u.user ?? u;
        setUser(userData);
        setProfileForm({
          name:          userData.name ?? "",
          phone:         userData.phone ?? "",
          payment_phone: userData.payment_phone ?? "",
          avatar:        userData.avatar ?? "",
        });
        setOrders(o.data ?? o.orders ?? o);
      })
      .catch(() => showToast("Failed to load profile.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const d = await fetchAPI("/auth/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(profileForm),
      });
      setUser(d.data ?? d.user ?? d);
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      await fetchAPI("/auth/change-password", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      showToast("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to change password.";
      setPwError(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "profile",  label: "Profile",    icon: "👤" },
    { key: "orders",   label: "My Orders",  icon: "🛒" },
    { key: "security", label: "Security",   icon: "🔒" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Account</p>
            <h1 className="text-xl font-bold text-white">My Profile</h1>
          </div>
          <a href="/" className="text-sm text-slate-400 hover:text-slate-200 transition">
            ← Back to Home
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">

        {/* Profile Hero */}
        <div className="bg-gradient-to-br from-violet-900/40 to-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-violet-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl font-bold text-white ring-4 ring-violet-500/30">
                {initials}
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${user?.is_active ? "bg-emerald-500" : "bg-slate-500"}`} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs px-2.5 py-0.5 rounded-full capitalize">
                {user?.role}
              </span>
              <span className="bg-slate-800 text-slate-400 border border-slate-700 text-xs px-2.5 py-0.5 rounded-full capitalize">
                {user?.provider}
              </span>
              {user?.is_email_verified && (
                <span className="bg-green-600/20 text-green-400 border border-green-500/30 text-xs px-2.5 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            {user?.last_login_at && (
              <p className="text-slate-500 text-xs mt-2">
                Last login: {new Date(user.last_login_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex sm:flex-col gap-4 sm:gap-2 text-center">
            <div className="bg-slate-800/60 rounded-xl px-4 py-2">
              <p className="text-xl font-bold text-emerald-400">{orders.length}</p>
              <p className="text-xs text-slate-500">Orders</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl px-4 py-2">
              <p className="text-xl font-bold text-violet-400">
                ৳{orders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Spent</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
                tab === t.key
                  ? "bg-violet-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                <input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Payment Phone (bKash / Nagad)</label>
                <input
                  value={profileForm.payment_phone}
                  onChange={(e) => setProfileForm({ ...profileForm, payment_phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Avatar URL</label>
                <input
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            {!orders.length ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-3">🛒</div>
                <p className="text-slate-400">You haven&apos;t placed any orders yet.</p>
              </div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-mono text-violet-400 text-sm font-semibold">{o.order_number}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[o.status] ?? ""}`}>
                        {o.status}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        o.payment_status === "paid"
                          ? "bg-green-400/10 text-green-400 border-green-400/30"
                          : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                      }`}>
                        {o.payment_status}
                      </span>
                    </div>
                  </div>

                  {o.order_items && o.order_items.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {o.order_items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">
                            {item.product_name}
                            {item.plan_name && <span className="text-slate-500"> · {item.plan_name}</span>}
                          </span>
                          <span className="text-slate-400 text-xs">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Total</span>
                    <span className="text-emerald-400 font-bold">৳{Number(o.total).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === "security" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Change Password</h3>

            {user?.provider !== "email" ? (
              <div className="bg-amber-950/40 border border-amber-700/40 text-amber-400 rounded-xl px-4 py-3 text-sm">
                You signed in with {user?.provider}. Password change is not available for social logins.
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {pwError && (
                  <p className="text-red-400 text-sm bg-red-950/40 border border-red-700/40 px-4 py-2 rounded-xl">{pwError}</p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={changePassword}
                    disabled={saving}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                  >
                    {saving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </div>
            )}

            {/* Account Details */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Account Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {([
                  ["Member Since",    new Date(user?.createdAt ?? "").toLocaleDateString()],
                  ["Account Status",  user?.is_active ? "Active" : "Suspended"],
                  ["Email Verified",  user?.is_email_verified ? "Yes ✓" : "No"],
                  ["Login Provider",  user?.provider ?? "—"],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="bg-slate-800/50 rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-slate-200 font-medium capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}