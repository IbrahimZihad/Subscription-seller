// components/layout/Navbar.tsx
"use client";

export default function Navbar() {
  const items = ["All", "AI Tools", "Streaming", "Education", "Utilities", "VPN"];

  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto flex gap-4 px-4 overflow-x-auto">
        {items.map((item, i) => (
          <button
            key={i}
            className="py-3 text-sm text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}