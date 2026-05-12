"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchAPI("/categories")
      .then((res) => {
        const data = Array.isArray(res)
          ? res
          : res?.categories || res?.data || [];

        setCategories(data);
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-12 bg-dark-800/30 border-y border-dark-700">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="font-heading font-bold text-white text-center mb-8 text-xl">
          Browse by Category
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Array.isArray(categories) &&
            categories.map((cat: any) => (
              <Link
                key={cat.id || cat._id}
                href={`/products?cat=${cat.id || cat._id}`}
                className="flex flex-col items-center gap-2 bg-dark-700 hover:bg-brand-500/10 border border-dark-600 hover:border-brand-500/40 rounded-2xl p-4 transition-all group"
              >
                <span className="text-3xl">{cat.icon || "📦"}</span>

                <span className="text-slate-300 text-sm text-center">
                  {cat.name}
                </span>

                <span className="text-slate-500 text-xs">
                  {cat.count || 0} items
                </span>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}