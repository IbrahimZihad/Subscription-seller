"use client";

import { useState } from "react";
import { useCart } from "@/store/cartStore";
import Topbar from "../components/layout/Topbar";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const totalPrice = cart.reduce((sum, p) => sum + (p.price * (p.qty || 1)), 0);

  const handleCheckout = () => {
    if (!name || !email || !phone) {
      alert("Please fill all fields");
      return;
    }

    // Here you can integrate payment gateway or backend API
    alert(`Thank you ${name}! Your order of ৳ ${totalPrice} has been placed.`);
    clearCart();
  };

  return (
    <>
      <Topbar />
      <Header />
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        {/* User Info Form */}
        <div className="border p-6 rounded space-y-4">
          <h2 className="text-2xl font-bold mb-4">Billing Information</h2>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Cart Summary */}
        <div className="border p-6 rounded space-y-4">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.qty && item.qty > 1 && (
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    )}
                  </div>
                  <span className="font-semibold">৳ {item.price * (item.qty || 1)}</span>
                </div>
              ))}

              <div className="flex justify-between font-bold text-lg pt-4">
                <span>Total</span>
                <span>৳ {totalPrice}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}