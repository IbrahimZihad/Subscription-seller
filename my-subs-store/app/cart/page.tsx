"use client";

import { useCart } from "@/store/cartStore";
import Topbar from "../components/layout/Topbar";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/Hero";
import Link from "next/link"; // ✅ import Link

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  // total price considering qty if available
  const totalPrice = cart.reduce((sum, p) => sum + (p.price * (p.qty || 1)), 0);

  return (
    <>
      <Topbar />
      <Header />
      <Navbar />
      <Hero />

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center border p-4 rounded"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{product.emoji}</div>
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm">{product.description}</p>
                    <p className="text-sm">{product.duration}</p>
                    {product.qty && product.qty > 1 && (
                      <p className="text-xs text-gray-400">Qty: {product.qty}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">৳ {product.price}</span>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <span className="font-bold text-lg">Total: ৳ {totalPrice}</span>
              <div className="space-x-2">
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear Cart
                </button>
                
                {/* ✅ Checkout button link */}
                <Link
                  href="/checkout"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}