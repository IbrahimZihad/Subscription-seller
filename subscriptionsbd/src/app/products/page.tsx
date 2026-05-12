"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import { fetchAPI } from "@/lib/api";

// -----------------------------
// Sort options
// -----------------------------
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [sort, setSort] = useState("featured");

  // -----------------------------
  // Fetch API
  // -----------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetchAPI("/products"),
          fetchAPI("/categories"),
        ]);

        // -----------------------------
        // FIX: normalize API responses
        // -----------------------------
        const productData =
          prodRes?.data ||
          prodRes?.products ||
          prodRes ||
          [];

        const categoryData =
          catRes?.data ||
          catRes?.categories ||
          catRes ||
          [];

        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (err) {
        console.error("API Error:", err);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // -----------------------------
  // Filter + Sort logic
  // -----------------------------
  const filtered = useMemo(() => {
    let list = [...products];

    // category filter
    if (selectedCat !== "all") {
      list = list.filter(
        (p) =>
          p.category === selectedCat ||
          p.category?.slug === selectedCat ||
          p.category?._id === selectedCat
      );
    }

    // search
    if (search) {
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // sorting
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, search, selectedCat, sort]);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-3 font-mono">
            All Products
          </span>

          <h1 className="font-heading font-extrabold text-4xl text-white mb-2">
            Premium <span className="gradient-text">Subscriptions</span>
          </h1>

          <p className="text-slate-400">
            {filtered.length} products available
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 text-white rounded-xl pl-10 pr-10 py-3 text-sm outline-none"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-slate-500" />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-dark-800 border border-dark-600 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">

          <button
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              selectedCat === "all"
                ? "bg-brand-500 text-white"
                : "bg-dark-700 border border-dark-600 text-slate-400"
            }`}
          >
            All ({products.length})
          </button>

          {/* FIX: safe array check */}
          {Array.isArray(categories) &&
            categories.map((cat: any) => {
              const id = cat.slug || cat._id || cat.id;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedCat(id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    selectedCat === id
                      ? "bg-brand-500 text-white"
                      : "bg-dark-700 border border-dark-600 text-slate-400"
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              );
            })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-slate-400 py-20">
            Loading products...
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product: any) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">😕</p>
              <h3 className="text-white text-xl font-bold mb-2">
                No products found
              </h3>
              <p className="text-slate-400">
                Try different filters
              </p>
            </div>
          )
        )}

      </div>
    </div>
  );
}