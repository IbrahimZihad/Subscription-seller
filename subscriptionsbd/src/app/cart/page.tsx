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
  MessageCircle,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    payMethod: "bkash",
    trxId: "",
    notes: "",
  });

  const discount = couponApplied ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "EID20") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponApplied(false);
      setCouponError("Invalid coupon code");
    }
  };

  const handleOrder = () => {
    if (!form.name || !form.phone || !form.trxId) return;
    setStep("success");
  };

  // ---------------- SUCCESS ----------------
  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-center px-4">
        <div>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-white text-3xl font-bold mb-2">Order Placed</h1>
          <p className="text-slate-400 mb-6">
            We will contact you on WhatsApp soon.
          </p>

          <Link href="/products" className="btn-primary inline-flex gap-2">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- EMPTY CART ----------------
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-center px-4">
        <div>
          <ShoppingBag className="mx-auto text-slate-600 mb-4" size={60} />
          <h2 className="text-white text-2xl font-bold mb-2">
            Your cart is empty
          </h2>
          <Link href="/products" className="btn-primary inline-flex gap-2">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- CART VIEW ----------------
  if (step === "cart") {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-dark-900">
        <div className="max-w-6xl mx-auto px-4">

          {/* Header */}
          <div className="flex justify-between mb-8">
            <h1 className="text-white text-3xl font-bold">
              Cart ({totalItems})
            </h1>

            <button
              onClick={clearCart}
              className="text-red-400 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ITEMS */}
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

                      <p className="text-slate-400 text-sm">
                        {item.plan?.name || "Standard"}
                      </p>

                      <div className="flex justify-between mt-3">
                        {/* quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                item.plan?.id,
                                item.quantity - 1
                              )
                            }
                            className="p-1 bg-dark-700 rounded"
                          >
                            <Minus size={14} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                product.id,
                                item.plan?.id,
                                item.quantity + 1
                              )
                            }
                            className="p-1 bg-dark-700 rounded"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-white font-bold">
                          ৳{price * item.quantity}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(product.id, item.plan?.id)
                      }
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY */}
            <div className="bg-dark-800 p-5 rounded-xl h-fit">
              <h3 className="text-white font-bold mb-4">Summary</h3>

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

              <button
                onClick={() => setStep("checkout")}
                className="btn-primary w-full mt-4"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- CHECKOUT ----------------
  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900 text-white">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => setStep("cart")}
          className="mb-6 text-slate-400 flex gap-2"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="space-y-4">
          <input
            placeholder="Name"
            className="w-full p-3 bg-dark-800 rounded"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Phone"
            className="w-full p-3 bg-dark-800 rounded"
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            placeholder="Transaction ID"
            className="w-full p-3 bg-dark-800 rounded"
            onChange={(e) =>
              setForm({ ...form, trxId: e.target.value })
            }
          />

          <button
            onClick={handleOrder}
            className="btn-primary w-full"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}