"use client";
import { useState, useEffect } from "react";
import { Phone, Mail, Clock, ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/data";

export default function Topbar() {
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handler = () => {
      const current = window.scrollY;
      setVisible(current <= lastScroll || current < 50);
      setLastScroll(current);
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [lastScroll]);

  return (
    <div
      className={`bg-dark-800 border-b border-dark-600 text-sm transition-all duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-1">
        {/* Left: promo */}
        <div className="flex items-center gap-2 text-brand-400 font-medium animate-pulse2">
          <ChevronRight size={14} />
          <span className="text-xs sm:text-sm">
            🎉 Eid Special: 20% OFF on all subscriptions — Use code{" "}
            <span className="bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-mono text-xs">EID20</span>
          </span>
        </div>

        {/* Right: contact info */}
        <div className="flex items-center gap-4 text-slate-400 text-xs">
          <a
            href={`tel:${siteConfig.phone}`}
            className="flex items-center gap-1.5 hover:text-brand-400 transition-colors"
          >
            <Phone size={12} />
            {siteConfig.phone}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="hidden sm:flex items-center gap-1.5 hover:text-brand-400 transition-colors"
          >
            <Mail size={12} />
            {siteConfig.email}
          </a>
          <span className="hidden md:flex items-center gap-1.5 text-green-400">
            <Clock size={12} />
            24/7 Support
          </span>
        </div>
      </div>
    </div>
  );
}
