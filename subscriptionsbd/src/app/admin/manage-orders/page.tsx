"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

type OrderStatus = "pending" | "paid" | "processing" | "delivered" | "completed" | "cancelled" | "refunded";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total: number;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  admin_notes: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-400/10 text-amber-400 border-amber-400/30",
  paid:       "bg-blue-400/10 text-blue-400 border-blue-400/30",
  processing: "bg-purple-400/10 text-purple-400 border-purple-400/30",
  delivered:  "bg-teal-400/10 text-teal-400 border-teal-400/30",
  completed:  "bg-green-400/10 text-green-400 border-green-400/30",
  cancelled:  "bg-red-400/10 text-red-400 border-red-400/30",
  refunded:   "bg-slate-400/10 text-slate-400 border-slate-400/30",
};

const ALL_STATUSES: OrderStatus[] = ["pending", "paid", "processing", "delivered", "completed", "cancelled", "refunded"];

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("adminToken") ?? "";
}

export default function ManageOrdersPage() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]         = useState<Order | null>(null);
  const [newStatus, setNewStatus]       = useState<OrderStatus>("pending");
  const [adminNote, setAdminNote]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetchAPI("/orders", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((d) => setOrders(d.data ?? d.orders ?? d))
      .catch(() => showToast("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (o: Order) => {
    setSelected(o);
    setNewStatus(o.status);
    setAdminNote(o.admin_notes ?? "");
  };

  const saveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetchAPI(`/orders/${selected.id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: newStatus, admin_notes: adminNote }),
      });
      showToast("Order updated successfully!");
      setSelected(null);
      fetchOrders();
    } catch {
      showToast("Failed to update order.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone?.includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Admin</p>
          <h1 className="text-xl font-bold text-white">Manage Orders</h1>
        </div>
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{filtered.length} orders</span>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by order #, name, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500 transition"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", ...ALL_STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize transition ${
                filterStatus === s
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 animate-pulse">Loading orders…</div>
          ) : !filtered.length ? (
            <div className="p-10 text-center text-slate-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Total</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Payment</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-violet-400 text-xs">{o.order_number}</td>
                      <td className="px-5 py-3">
                        <p className="text-slate-200 font-medium">{o.customer_name}</p>
                        <p className="text-slate-500 text-xs">{o.customer_phone}</p>
                      </td>
                      <td className="px-5 py-3 font-semibold text-emerald-400">৳{Number(o.total).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[o.status] ?? ""}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          o.payment_status === "paid"
                            ? "bg-green-400/10 text-green-400 border-green-400/30"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => openOrder(o)}
                          className="text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 border border-violet-500/30 px-3 py-1 rounded-lg transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Manage Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Order</p>
                <h2 className="text-lg font-bold text-violet-400 font-mono">{selected.order_number}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-1 text-sm">
                <p><span className="text-slate-400">Name:</span> <span className="text-slate-200">{selected.customer_name}</span></p>
                <p><span className="text-slate-400">Phone:</span> <span className="text-slate-200">{selected.customer_phone}</span></p>
                {selected.customer_email && (
                  <p><span className="text-slate-400">Email:</span> <span className="text-slate-200">{selected.customer_email}</span></p>
                )}
                <p><span className="text-slate-400">Total:</span> <span className="text-emerald-400 font-semibold">৳{Number(selected.total).toLocaleString()}</span></p>
                <p><span className="text-slate-400">Payment:</span> <span className="text-slate-200 capitalize">{selected.payment_method ?? "—"}</span></p>
              </div>

              {/* Update Status */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Admin Notes</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Internal notes about this order…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveStatus}
                  disabled={saving}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}