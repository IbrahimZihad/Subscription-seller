"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

// ─── Types ────────────────────────────────────────────────────
type Step = "cart" | "checkout" | "success";

type PaymentMethod = "bkash" | "nagad" | "rocket" | "sslcommerz" | "bank";

interface FormState {
  name: string;
  phone: string;
  email: string;
  payMethod: PaymentMethod;
  trxId: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  payMethod?: string;
  trxId?: string;
}

// ─── Validation helpers ───────────────────────────────────────
const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bkash",      label: "bKash"       },
  { value: "nagad",      label: "Nagad"       },
  { value: "rocket",     label: "Rocket"      },
  { value: "sslcommerz", label: "SSLCommerz"  },
  { value: "bank",       label: "Bank Transfer"},
];

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  } else if (form.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!BD_PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = "Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX).";
  }

  if (!form.payMethod) {
    errors.payMethod = "Please select a payment method.";
  }

  if (form.payMethod !== "sslcommerz") {
    if (!form.trxId.trim()) {
      errors.trxId = "Transaction ID is required for manual payments.";
    } else if (form.trxId.trim().length < 6) {
      errors.trxId = "Transaction ID seems too short. Please double-check.";
    }
  }

  return errors;
}

// ─── Field error component ────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function CartPage() {
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();

  // Coupon
  const [coupon, setCoupon]               = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Step
  const [step, setStep] = useState<Step>("cart");

  // Form
  const [form, setForm] = useState<FormState>({
    name:      "",
    phone:     "",
    email:     "",
    payMethod: "bkash",
    trxId:     "",
    notes:     "",
  });

  const [formErrors, setFormErrors]   = useState<FormErrors>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError]     = useState("");

  // Derived
  const discount   = couponApplied ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice - discount;

  // ── Coupon ──────────────────────────────────────────────────
  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: coupon.trim(), orderAmount: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Invalid coupon");
      setCouponApplied(true);
    } catch (err: any) {
      setCouponApplied(false);
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCoupon("");
    setCouponError("");
  };

  // ── Order ───────────────────────────────────────────────────
  const handleOrder = async () => {
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setOrderLoading(true);
    setOrderError("");

    try {
      const items = state.items.map((item) => ({
        productId: item.product.id,
        planId:    item.plan?.id || null,
        quantity:  item.quantity,
      }));

      const payload = {
        customerName:  form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || null,
        paymentMethod: form.payMethod,
        transactionId: form.payMethod !== "sslcommerz" ? form.trxId.trim() : null,
        couponCode:    couponApplied ? coupon.trim().toUpperCase() : null,
        notes:         form.notes.trim() || null,
        items,
      };

      const token = typeof window !== "undefined"
        ? localStorage.getItem("auth_token")
        : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order. Please try again.");

      clearCart();
      setStep("success");
    } catch (err: any) {
      setOrderError(err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  // ── Field change helper ─────────────────────────────────────
  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ════════════════════════════════════════════════════════════
  // SUCCESS
  // ════════════════════════════════════════════════════════════
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-center px-4">
        <div>
          <CheckCircle2 className="mx-auto text-green-400 mb-4" size={60} />
          <h1 className="text-white text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-slate-400 mb-6">
            We will contact you on WhatsApp soon.
          </p>
          <Link href="/products" className="btn-primary inline-flex gap-2 items-center">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // EMPTY
  // ════════════════════════════════════════════════════════════
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-center px-4">
        <div>
          <ShoppingBag className="mx-auto text-slate-600 mb-4" size={60} />
          <h2 className="text-white text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link href="/products" className="btn-primary inline-flex gap-2 items-center">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // CART VIEW
  // ════════════════════════════════════════════════════════════
  if (step === "cart") {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-dark-900">
        <div className="max-w-6xl mx-auto px-4">

          {/* Header */}
          <div className="flex justify-between mb-8">
            <h1 className="text-white text-3xl font-bold">Cart ({totalItems})</h1>
            <button onClick={clearCart} className="text-red-400 flex items-center gap-2 text-sm">
              <Trash2 size={14} /> Clear All
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => {
                const product = item.product;

                const name =
                  typeof product.name === "object"
                    ? product.name?.name || "Product"
                    : product.name;

                const image =
                  typeof product.image === "object"
                    ? product.image?.url
                    : product.image;

                const price =
                  item.plan?.price ||
                  Number(product.price || product.basePrice || 0);

                return (
                  <div
                    key={`${product.id}-${item.plan?.id}`}
                    className="flex gap-4 bg-dark-800 p-4 rounded-xl"
                  >
                    <Image
                      src={image}
                      alt={name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{name}</h3>
                      <p className="text-slate-400 text-sm">{item.plan?.name || "Standard"}</p>

                      <div className="flex justify-between items-center mt-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(product.id, item.plan?.id, item.quantity - 1)}
                            className="p-1 bg-dark-700 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, item.plan?.id, item.quantity + 1)}
                            className="p-1 bg-dark-700 rounded"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-white font-bold">৳{price * item.quantity}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(product.id, item.plan?.id)}
                      className="text-red-400 self-start"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="bg-dark-800 p-5 rounded-xl h-fit space-y-4">
              <h3 className="text-white font-bold">Order Summary</h3>

              {/* Coupon */}
              {!couponApplied ? (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 bg-dark-700 rounded text-white text-sm"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="px-3 py-2 bg-primary-600 text-white rounded text-sm flex items-center gap-1 disabled:opacity-50"
                    >
                      {couponLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {couponError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-900/20 border border-green-700 rounded px-3 py-2">
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <Tag size={12} /> {coupon.toUpperCase()} applied
                  </span>
                  <button onClick={removeCoupon} className="text-slate-400 text-xs underline">Remove</button>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{totalPrice}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold border-t border-dark-600 pt-2">
                  <span>Total</span>
                  <span>৳{finalTotal}</span>
                </div>
              </div>

              <button onClick={() => setStep("checkout")} className="btn-primary w-full">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // CHECKOUT
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900 text-white">
      <div className="max-w-2xl mx-auto px-4">

        <button
          onClick={() => setStep("cart")}
          className="mb-6 text-slate-400 flex items-center gap-2 text-sm hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Cart
        </button>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="bg-dark-800 rounded-xl p-6 space-y-5">

          {/* Customer Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="e.g. Rahim Uddin"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full p-3 bg-dark-700 rounded-lg text-white placeholder-slate-500 outline-none border ${
                formErrors.name ? "border-red-500" : "border-transparent focus:border-primary-500"
              } transition-colors`}
            />
            <FieldError message={formErrors.name} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              placeholder="01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={`w-full p-3 bg-dark-700 rounded-lg text-white placeholder-slate-500 outline-none border ${
                formErrors.phone ? "border-red-500" : "border-transparent focus:border-primary-500"
              } transition-colors`}
            />
            <FieldError message={formErrors.phone} />
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email (optional)</label>
            <input
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full p-3 bg-dark-700 rounded-lg text-white placeholder-slate-500 outline-none border border-transparent focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Payment Method <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => {
                    handleChange("payMethod", m.value);
                    if (m.value === "sslcommerz") handleChange("trxId", "");
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                    form.payMethod === m.value
                      ? "bg-primary-600 border-primary-500 text-white"
                      : "bg-dark-700 border-dark-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <FieldError message={formErrors.payMethod} />
          </div>

          {/* Transaction ID — hidden for SSLCommerz */}
          {form.payMethod !== "sslcommerz" && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Transaction ID <span className="text-red-400">*</span>
              </label>
              <input
                placeholder="Enter your TrxID from payment app"
                value={form.trxId}
                onChange={(e) => handleChange("trxId", e.target.value)}
                className={`w-full p-3 bg-dark-700 rounded-lg text-white placeholder-slate-500 outline-none border ${
                  formErrors.trxId ? "border-red-500" : "border-transparent focus:border-primary-500"
                } transition-colors`}
              />
              <FieldError message={formErrors.trxId} />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Order Notes (optional)</label>
            <textarea
              placeholder="Any special instructions..."
              value={form.notes}
              rows={3}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full p-3 bg-dark-700 rounded-lg text-white placeholder-slate-500 outline-none border border-transparent focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          {/* Order total recap */}
          <div className="border-t border-dark-600 pt-4 flex justify-between text-sm">
            <span className="text-slate-400">Total to Pay</span>
            <span className="text-white font-bold text-lg">৳{finalTotal}</span>
          </div>

          {/* API error */}
          {orderError && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {orderError}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleOrder}
            disabled={orderLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {orderLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                Place Order <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}