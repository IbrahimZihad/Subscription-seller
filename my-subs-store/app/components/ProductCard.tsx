"use client";

import { Product } from "@/types/product";
import { useCart } from "@/store/cartStore";

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useCart((state) => state.addToCart);

  const badgeColor = {
    ai: "bg-blue-100 text-blue-700",
    stream: "bg-yellow-100 text-yellow-700",
    edu: "bg-green-100 text-green-700",
    util: "bg-purple-100 text-purple-700",
    vpn: "bg-gray-200 text-gray-700",
  }[product.category];

  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition">
      <div className="text-4xl text-center mb-2">{product.emoji}</div>

      <span className={`text-xs px-2 py-1 rounded ${badgeColor}`}>
        {product.category.toUpperCase()}
      </span>

      <h3 className="font-semibold mt-2">{product.name}</h3>
      <p className="text-xs text-gray-500">{product.description}</p>

      <div className="flex justify-between items-center mt-3">
        <div>
          <div className="font-bold text-blue-600">
            ৳ {product.price}
          </div>
          <div className="text-xs text-gray-400">
            {product.duration}
          </div>
        </div>

        {product.stock ? (
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        ) : (
          <span className="text-gray-400 text-xs">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}