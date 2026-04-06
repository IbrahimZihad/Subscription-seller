// components/Hero.tsx
export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-500 text-white text-center py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">
        Premium Subscriptions at the Best Price in BD
      </h1>
      <p className="text-sm opacity-90 mb-6">
        Get ChatGPT, Claude, YouTube Premium, and more — delivered instantly
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {[
          "Instant Delivery",
          "Bkash / Nagad",
          "100% Trusted",
          "24/7 Support",
        ].map((item) => (
          <span
            key={item}
            className="border border-white/40 bg-white/10 px-3 py-1 rounded-full text-xs"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}