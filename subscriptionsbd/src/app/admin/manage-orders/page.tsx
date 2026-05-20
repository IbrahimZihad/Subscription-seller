"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAPI } from "@/lib/api";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

// Handles both snake_case (DB) and camelCase (Sequelize model) field names
interface RawOrder {
  id: number;
  order_number?: string;  orderNumber?: string;
  customer_name?: string; customerName?: string;
  customer_phone?: string; customerPhone?: string;
  customer_email?: string; customerEmail?: string;
  total: number;
  subtotal: number;
  discount_amount?: number; discountAmount?: number;
  status: OrderStatus;
  payment_status?: string; paymentStatus?: string;
  payment_method?: string; paymentMethod?: string;
  transaction_id?: string | null; transactionId?: string | null;
  admin_notes?: string; adminNotes?: string;
  notes?: string | null;
  items?: RawOrderItem[];
  createdAt: string;
}

interface RawOrderItem {
  id: number;
  product_name?: string; productName?: string;
  plan_name?: string | null; planName?: string | null;
  quantity: number;
  unit_price?: number; unitPrice?: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string | null;
  adminNotes: string;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  id: number;
  productName: string;
  planName: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

function normaliseItem(i: RawOrderItem): OrderItem {
  return {
    id:          i.id,
    productName: i.product_name ?? i.productName ?? "Unknown Product",
    planName:    i.plan_name    ?? i.planName    ?? null,
    quantity:    i.quantity     ?? 1,
    unitPrice:   Number(i.unit_price ?? i.unitPrice ?? 0),
    subtotal:    Number(i.subtotal   ?? 0),
  };
}

function normaliseOrder(o: RawOrder): Order {
  return {
    id:             o.id,
    orderNumber:    o.order_number    ?? o.orderNumber    ?? `#${o.id}`,
    customerName:   o.customer_name   ?? o.customerName   ?? "—",
    customerPhone:  o.customer_phone  ?? o.customerPhone  ?? "—",
    customerEmail:  o.customer_email  ?? o.customerEmail  ?? "",
    total:          Number(o.total    ?? 0),
    subtotal:       Number(o.subtotal ?? 0),
    discountAmount: Number(o.discount_amount ?? o.discountAmount ?? 0),
    status:         o.status,
    paymentStatus:  o.payment_status  ?? o.paymentStatus  ?? "unpaid",
    paymentMethod:  o.payment_method  ?? o.paymentMethod  ?? "—",
    transactionId:  o.transaction_id  ?? o.transactionId  ?? null,
    adminNotes:     o.admin_notes     ?? o.adminNotes     ?? "",
    notes:          o.notes           ?? null,
    items:          (o.items ?? []).map(normaliseItem),
    createdAt:      o.createdAt,
  };
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

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid:     "bg-green-400/10 text-green-400 border-green-400/30",
  unpaid:   "bg-amber-400/10 text-amber-400 border-amber-400/30",
  failed:   "bg-red-400/10 text-red-400 border-red-400/30",
  refunded: "bg-slate-400/10 text-slate-400 border-slate-400/30",
};

const ALL_STATUSES: OrderStatus[] = [
  "pending", "paid", "processing", "delivered", "completed", "cancelled", "refunded",
];

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("adminToken") ?? "";
}

function Row({ label, value, mono = false, capitalize = false }: {
  label: string; value: string; mono?: boolean; capitalize?: boolean;
}) {
  return (
    <p>
      <span className="text-slate-400">{label}: </span>
      <span className={`text-slate-200 ${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value || "—"}
      </span>
    </p>
  );
}

export default function ManageOrdersPage() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]         = useState<Order | null>(null);
  const [newStatus, setNewStatus]       = useState<OrderStatus>("pending");
  const [newPayStatus, setNewPayStatus] = useState("unpaid");
  const [adminNote, setAdminNote]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchAPI("/orders?limit=200", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const raw: RawOrder[] = d.data ?? d.orders ?? d;
      setOrders(raw.map(normaliseOrder));
    } catch {
      showToast("Failed to load orders.", false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openOrder = (o: Order) => {
    setSelected(o);
    setNewStatus(o.status);
    setNewPayStatus(o.paymentStatus);
    setAdminNote(o.adminNotes);
  };

  const saveStatus = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetchAPI(`/orders/${selected.id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          status:        newStatus,
          paymentStatus: newPayStatus,
          adminNotes:    adminNote,
        }),
      });
      showToast("Order updated successfully!");
      setSelected(null);
      fetchOrders();
    } catch {
      showToast("Failed to update order.", false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q)         ||
      o.customerName.toLowerCase().includes(q)        ||
      o.customerPhone.includes(q)                     ||
      (o.customerEmail ?? "").toLowerCase().includes(q) ||
      o.items.some((i) => i.productName.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const countByStatus = (s: string) =>
    s === "all" ? orders.length : orders.filter((o) => o.status === s).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${
          toast.ok ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest">Admin</p>
          <h1 className="text-xl font-bold text-white">Manage Orders</h1>
        </div>
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by order #, name, phone, email, product…"
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

        {/* Status tabs */}
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
              {s} ({countByStatus(s)})
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
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-900/50">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Order #</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Products</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">

                      {/* ID */}
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono">#{o.id}</td>

                      {/* Order # */}
                      <td className="px-4 py-3 font-mono text-violet-400 text-xs whitespace-nowrap">
                        {o.orderNumber}
                      </td>

                      {/* Customer — customer_name, customer_phone, customer_email from orders table */}
                      <td className="px-4 py-3">
                        <p className="text-slate-200 font-medium whitespace-nowrap">{o.customerName}</p>
                        <p className="text-slate-500 text-xs">{o.customerPhone}</p>
                        {o.customerEmail && (
                          <p className="text-slate-600 text-xs truncate max-w-[140px]">{o.customerEmail}</p>
                        )}
                      </td>

                      {/* Products — product_name, plan_name from order_items table */}
                      <td className="px-4 py-3 max-w-[200px]">
                        {o.items.length === 0 ? (
                          <span className="text-slate-500 text-xs italic">No items</span>
                        ) : (
                          <div className="space-y-0.5">
                            {o.items.map((item) => (
                              <p key={item.id} className="text-slate-300 text-xs truncate" title={item.productName}>
                                {item.productName}
                                {item.planName && <span className="text-slate-500"> · {item.planName}</span>}
                                <span className="text-slate-600"> ×{item.quantity}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 font-semibold text-emerald-400 whitespace-nowrap">
                        ৳{Number(o.total).toLocaleString()}
                      </td>

                      {/* Order status */}
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[o.status] ?? ""}`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`block px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit ${PAYMENT_STATUS_COLORS[o.paymentStatus] ?? ""}`}>
                            {o.paymentStatus}
                          </span>
                          {o.paymentMethod !== "—" && (
                            <span className="text-slate-500 text-xs capitalize">{o.paymentMethod}</span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openOrder(o)}
                          className="text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg transition"
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

      {/* ── Modal ─────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">

            <div className="p-6 border-b border-slate-800 flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  Order ID <span className="font-mono text-slate-300">#{selected.id}</span>
                </p>
                <h2 className="text-lg font-bold text-violet-400 font-mono">{selected.orderNumber}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-2xl leading-none ml-4">×</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Customer — from orders table */}
              <section>
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Customer Info</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
                  <Row label="Name"    value={selected.customerName} />
                  <Row label="Phone"   value={selected.customerPhone} />
                  {selected.customerEmail && <Row label="Email" value={selected.customerEmail} />}
                  <Row label="Payment" value={selected.paymentMethod} capitalize />
                  {selected.transactionId && <Row label="Txn ID" value={selected.transactionId} mono />}
                </div>
              </section>

              {/* Products — from order_items table */}
              <section>
                <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Products Ordered</h3>
                <div className="space-y-2">
                  {selected.items.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">No items found.</p>
                  ) : (
                    selected.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 text-sm">
                        <div>
                          <p className="text-slate-200 font-medium">{item.productName}</p>
                          {item.planName && <p className="text-slate-500 text-xs mt-0.5">{item.planName}</p>}
                          <p className="text-slate-600 text-xs mt-0.5">
                            ৳{item.unitPrice.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-emerald-400 font-semibold">৳{item.subtotal.toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Totals */}
              <section className="bg-slate-800/30 rounded-xl px-4 py-3 text-sm space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span><span>৳{selected.subtotal.toLocaleString()}</span>
                </div>
                {selected.discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span><span>-৳{selected.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold border-t border-slate-700 pt-1.5">
                  <span>Total</span><span>৳{selected.total.toLocaleString()}</span>
                </div>
              </section>

              {/* Order status */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Order Status</label>
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

              {/* Payment status */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Payment Status</label>
                <select
                  value={newPayStatus}
                  onChange={(e) => setNewPayStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  {["unpaid", "paid", "failed", "refunded"].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Admin notes */}
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Admin Notes</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="Internal notes…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition resize-none"
                />
              </div>

              {selected.notes && (
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Customer Notes</label>
                  <p className="bg-slate-800/50 rounded-xl px-4 py-3 text-sm text-slate-300 italic">{selected.notes}</p>
                </div>
              )}

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