"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, Zap, Search } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Topbar from "./Topbar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Topbar />
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-dark-900/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-dark-700"
            : "bg-dark-900/80 backdrop-blur-md border-b border-dark-700/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform glow-brand">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <div className="leading-tight">
              <span className="font-heading font-bold text-lg text-white block leading-none">
                Subscriptions
              </span>
              <span className="text-brand-400 text-xs font-medium font-body">BD</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 font-body ${
                  pathname === link.href
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
              <Search size={18} />
            </button>

            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl bg-dark-700 hover:bg-brand-500/20 border border-dark-600 hover:border-brand-500/50 transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingCart size={18} className="text-slate-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile burger */}
            <button
              className="md:hidden p-2.5 rounded-xl bg-dark-700 border border-dark-600 text-slate-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="px-4 pb-4 flex flex-col gap-1 border-t border-dark-700 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all font-body ${
                  pathname === link.href
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 px-4 py-3 bg-dark-700 rounded-xl">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="bg-transparent text-sm text-white outline-none flex-1 placeholder-slate-500 font-body"
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
