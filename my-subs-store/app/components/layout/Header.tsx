// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/store/cartStore";
import { useState } from "react";

export default function Header() {
  const cart = useCart((state) => state.cart);
  const count = cart.reduce((sum, x) => sum + (x.qty || 1), 0); // count items
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between p-4 gap-4">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Subs<span className="text-black">Store</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md border rounded-md overflow-hidden flex">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm outline-none"
            placeholder="Search subscriptions..."
          />
          <button className="bg-blue-600 text-white px-4 text-sm hover:bg-blue-700 transition">
            Search
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition">
            Sign In
          </button>

          <Link
            href="/cart"
            className="relative bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}