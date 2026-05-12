"use client";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Clock, CheckCircle } from "lucide-react";

const stats = [
  { value: "25,000+", label: "Happy Customers" },
  { value: "200+", label: "Products" },
  { value: "30 min", label: "Avg Delivery" },
  { value: "24/7", label: "Support" },
];

const trusted = ["Netflix", "ChatGPT", "Spotify", "Canva", "Microsoft", "Grammarly"];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-36 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark-900 grid-bg" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent" />

      {/* Glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-brand-300 text-sm font-medium font-body">
                Bangladesh&apos;s #1 Subscription Store
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Premium Digital
              <br />
              <span className="gradient-text">Subscriptions</span>
              <br />
              <span className="text-slate-300 text-3xl sm:text-4xl lg:text-5xl">At BD Prices</span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 font-body max-w-lg">
              Get Netflix, ChatGPT, Spotify, Canva & 200+ premium tools in Bangladesh. Pay with{" "}
              <span className="text-brand-400 font-semibold">bKash, Nagad, Rocket</span> — instant delivery with warranty.
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { icon: Shield, text: "100% Genuine" },
                { icon: Zap, text: "Instant Delivery" },
                { icon: Clock, text: "24/7 Support" },
              ].map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 bg-dark-700 border border-dark-600 text-slate-300 text-sm px-3 py-1.5 rounded-lg font-body"
                >
                  <Icon size={14} className="text-brand-400" />
                  {text}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary flex items-center gap-2 text-base">
                Browse Products
                <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="btn-outline text-base">
                Chat with Us
              </Link>
            </div>
          </div>

          {/* Right: stats card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="glass rounded-3xl p-8 border border-white/10">
                <h3 className="font-heading font-bold text-white text-xl mb-6">
                  Why Choose Us?
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {stats.map(({ value, label }) => (
                    <div key={label} className="bg-dark-700/60 rounded-2xl p-4">
                      <p className="font-heading font-extrabold text-3xl gradient-text">{value}</p>
                      <p className="text-slate-400 text-sm font-body">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  {[
                    "Verified authentic accounts",
                    "Replacement warranty included",
                    "Local BDT payments accepted",
                    "Fastest delivery in Bangladesh",
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-slate-300 text-sm font-body">
                      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-brand-500 text-white rounded-2xl px-4 py-2 shadow-lg animate-float">
                <p className="font-heading font-bold text-sm">⚡ Instant Delivery</p>
              </div>

              {/* Floating payment badge */}
              <div className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-2.5 border border-white/10">
                <p className="text-slate-400 text-xs mb-1 font-body">Accept payments via</p>
                <p className="text-white font-semibold text-sm font-heading">
                  bKash · Nagad · Rocket
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="mt-16 pt-8 border-t border-dark-700">
          <p className="text-slate-500 text-sm mb-6 font-body text-center">
            Trusted subscriptions from world-class platforms
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {trusted.map((brand) => (
              <span
                key={brand}
                className="bg-dark-700 border border-dark-600 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl font-heading hover:border-brand-500/40 hover:text-brand-300 transition-all cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
