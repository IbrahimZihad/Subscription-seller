"use client";

import { useState } from "react";
import Topbar from "./components/layout/Topbar";
import Header from "./components/layout/Header";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/Hero";
import CategoryTabs from "./components/CategoryTabs";
import ProductCard from "./components/ProductCard";
import { Product } from "@/types/product";

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "ChatGPT Plus",
    emoji: "🤖",
    category: "ai",
    description: "GPT-4o access",
    price: 2350,
    duration: "1 Month",
    stock: true,
  },
  {
    id: 2,
    name: "Claude Pro",
    emoji: "💜",
    category: "ai",
    description: "Best for coding",
    price: 2350,
    duration: "1 Month",
    stock: true,
  },
  {
    id: 3,
    name: "YouTube Premium",
    emoji: "▶️",
    category: "stream",
    description: "Ad-free YouTube",
    price: 1150,
    duration: "1 Month",
    stock: true,
  },
];

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = filter === "all" || p.category === filter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  return (
    <>
      <Topbar />
      <Header />
      <Navbar />
      <Hero />

      <main className="max-w-6xl mx-auto p-6">
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded mb-4 w-full max-w-sm"
        />

        {/* Category Tabs */}
        <CategoryTabs current={filter} setFilter={setFilter} />

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No products found
            </p>
          )}
        </div>
      </main>
    </>
  );
}