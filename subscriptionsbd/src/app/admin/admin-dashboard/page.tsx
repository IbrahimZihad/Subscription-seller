"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  pendingReviews: number;
  totalBlogs: number;
  recentOrders: RecentOrder[];
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  delivered:  "bg-teal-100 text-teal-700",
  completed:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-600",
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("adminToken") ?? "";
}

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetchAPI("/admin/stats", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((d) => setStats(d.data ?? d))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Revenue",   value: `৳${Number(stats.totalRevenue).toLocaleString()}`, icon: "💰", color: "from-emerald-500 to-teal-600" },
        { label: "Total Orders",    value: stats.totalOrders,    icon: "🛒", color: "from-blue-500 to-indigo-600" },
        { label: "Pending Orders",  value: stats.pendingOrders,  icon: "⏳", color: "from-amber-400 to-orange-500" },
        { label: "Total Products",  value: stats.totalProducts,  icon: "📦", color: "from-violet-500 to-purple-600" },
        { label: "Total Users",     value: stats.totalUsers,     icon: "👥", color: "from-pink-500 to-rose-600" },
        { label: "Pending Reviews", value: stats.pendingReviews, icon: "⭐", color: "from-yellow-400 to-amber-500" },
        { label: "Blog Posts",      value: stats.totalBlogs,     icon: "📝", color: "from-cyan-500 to-sky-600" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Subscriptions BD</p>
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{new Date().toDateString()}</span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">A</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-10">

        {error && (
          <div className="bg-red-950/60 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {/* Stat Cards */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-4">Overview</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.color} p-5 shadow-lg`}>
                  <span className="absolute right-4 top-4 text-3xl opacity-30">{s.icon}</span>
                  <p className="text-xs text-white/70 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Orders */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-4">Recent Orders</h2>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500 animate-pulse">Loading…</div>
            ) : !stats?.recentOrders?.length ? (
              <div className="p-8 text-center text-slate-500">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Order #</th>
                      <th className="px-5 py-3 text-left">Customer</th>
                      <th className="px-5 py-3 text-left">Total</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-violet-400">{o.order_number}</td>
                        <td className="px-5 py-3 text-slate-200">{o.customer_name}</td>
                        <td className="px-5 py-3 font-semibold text-emerald-400">৳{Number(o.total).toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[o.status] ?? "bg-slate-700 text-slate-300"}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}