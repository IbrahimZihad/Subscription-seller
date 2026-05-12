"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Clock, Shield } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface Props {
  product: any; // ✅ allow API shape
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  // -----------------------------
  // ✅ NORMALIZE API DATA
  // -----------------------------
  const price =
    Number(product?.price) ||
    Number(product?.basePrice) ||
    Number(product?.plans?.[0]?.price) ||
    0;

  const originalPrice =
    Number(product?.originalPrice) ||
    Number(product?.plans?.[0]?.originalPrice) ||
    0;

  const rating = Number(product?.rating || product?.avgRating || 0);
  const reviews = Number(product?.reviews || product?.reviewCount || 0);

  const categoryName =
    typeof product?.category === "string"
      ? product.category
      : product?.category?.name || "general";

  const discount =
    originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const image = product?.image || "/placeholder.png";

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="product-card card-dark group flex flex-col h-full">

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <Image
          src={image}
          alt={product?.name || "Product"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />

        {/* Badge */}
        {product?.badge && (
          <span className="absolute top-3 left-3 bg-brand-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {product.badge}
          </span>
        )}

        {/* Discount */}
        {discount && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Category */}
        <p className="text-brand-400 text-xs uppercase mb-1">
          {categoryName.replace("-", " ")}
        </p>

        {/* Name */}
        <h3 className="text-white text-lg font-bold mb-2 line-clamp-1">
          {product?.name}
        </h3>

        {/* Description (HTML safe) */}
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
          {typeof product?.description === "string"
            ? product.description.replace(/<[^>]*>?/gm, "")
            : ""}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-400">

          <span className="flex items-center gap-1 text-yellow-400">
            <Star size={12} fill="currentColor" />
            {rating.toFixed(1)} ({reviews})
          </span>

          <span className="flex items-center gap-1">
            <Clock size={12} className="text-green-400" />
            {product?.deliveryTime || "Instant"}
          </span>

          <span className="flex items-center gap-1">
            <Shield size={12} className="text-brand-400" />
            Warranty
          </span>

        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4 mt-auto">
          <span className="text-2xl font-bold text-white">
            ৳{price}
          </span>

          {originalPrice > 0 && (
            <span className="text-slate-500 text-sm line-through">
              ৳{originalPrice}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">

          <Link
            href={`/products/${product?.slug}`}
            className="flex-1 text-center py-2.5 rounded-xl border border-brand-500/40 text-brand-400 hover:bg-brand-500/10 text-sm"
          >
            Details
          </Link>

          <button
            onClick={() =>
              addItem(product, product?.plans?.[0] || undefined)
            }
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm"
          >
            <ShoppingCart size={14} />
            Add
          </button>

        </div>
      </div>
    </div>
  );
}