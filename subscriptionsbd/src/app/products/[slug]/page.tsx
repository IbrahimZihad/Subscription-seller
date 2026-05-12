"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  Star,
  ShoppingCart,
  Shield,
  Clock,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

import { fetchAPI } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // -----------------------------
  // FETCH PRODUCT
  // -----------------------------
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetchAPI(`/products/${slug}`);
        const data = res?.data || res;

        if (!data) {
          setProduct(null);
          return;
        }

        setProduct(data);
        setSelectedPlan(data.plans?.[0] || null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProduct();
  }, [slug]);

  // -----------------------------
  // NOT FOUND
  // -----------------------------
  if (!loading && !product) {
    notFound();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading product...
      </div>
    );
  }

  // -----------------------------
  // SAFE VALUES (IMPORTANT FIX)
  // -----------------------------
  const price = selectedPlan
    ? Number(selectedPlan.price)
    : Number(product.basePrice || product.price || 0);

  const originalPrice = Number(product.originalPrice || 0);

  const discount =
    originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const rating = Number(product.avgRating || product.rating || 0);

  const reviewCount = product.reviewCount ?? product.reviews ?? 0;

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name || "Uncategorized";

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-8">
          <Link href="/" className="hover:text-brand-400">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-400">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-300">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* IMAGE */}
          <div className="relative aspect-video rounded-3xl overflow-hidden card-dark">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />

            {product.badge && (
              <span className="absolute top-4 left-4 bg-brand-500 text-white text-sm px-3 py-1.5 rounded-xl">
                {product.badge}
              </span>
            )}

            {discount && (
              <span className="absolute top-4 right-4 bg-green-500 text-white text-sm px-3 py-1.5 rounded-xl">
                -{discount}%
              </span>
            )}
          </div>

          {/* INFO */}
          <div>

            {/* CATEGORY FIX */}
            <p className="text-brand-400 text-sm uppercase mb-2">
              {categoryName}
            </p>

            <h1 className="text-white text-3xl font-extrabold mb-3">
              {product.name}
            </h1>

            {/* RATING FIX */}
            <div className="flex items-center gap-3 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s <= Math.round(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-600"
                  }
                />
              ))}

              <span className="text-slate-400 text-sm">
                {rating} ({reviewCount})
              </span>

              <span className="text-green-400 text-sm flex items-center gap-1">
                <Clock size={14} />
                {product.deliveryTime}
              </span>
            </div>

            <p className="text-slate-300 mb-6">
              {product.description}
            </p>

            {/* PLANS */}
            {product.plans?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white text-sm mb-3 uppercase">
                  Choose Plan
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {product.plans.map((plan: any) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-xl border ${
                        selectedPlan?.id === plan.id
                          ? "border-brand-500 bg-brand-500/10 text-brand-300"
                          : "border-dark-600 text-slate-400"
                      }`}
                    >
                      <p className="font-bold text-sm">{plan.name}</p>
                      <p className="text-xs">{plan.duration}</p>
                      <p className="font-bold mt-1">৳{Number(plan.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PRICE */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-white text-4xl font-bold">
                ৳{price}
              </span>

              {originalPrice > 0 && (
                <span className="text-slate-500 line-through">
                  ৳{originalPrice}
                </span>
              )}
            </div>

            {/* FEATURES SAFE MAP */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              {(product.features || []).map((f: string, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-slate-300 text-sm"
                >
                  <CheckCircle size={14} className="text-green-400" />
                  {f}
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={() => addItem(product, selectedPlan)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <a
                href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                  `Hi! I want ${product.name}`
                )}`}
                target="_blank"
                className="bg-green-500/15 border border-green-500/30 text-green-400 px-6 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>

            </div>

            {/* TRUST */}
            <div className="flex gap-4 mt-6 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Shield size={13} /> Warranty
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} /> Fast Delivery
              </span>
            </div>

          </div>
        </div>

        {/* BACK */}
        <div className="mt-12">
          <Link
            href="/products"
            className="text-slate-400 hover:text-brand-400 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to products
          </Link>
        </div>

      </div>
    </div>
  );
}