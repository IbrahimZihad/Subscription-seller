"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShoppingCart, Menu, X, Zap, Search,
  User, LogOut, LayoutDashboard, Package,
  ShoppingBag, BookOpen, ChevronDown,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import Topbar from "./Topbar";

const navLinks = [
  { href: "/",         label: "Home"     },
  { href: "/products", label: "Products" },
  { href: "/blog",     label: "Blog"     },
  { href: "/about",    label: "About"    },
  { href: "/contact",  label: "Contact"  },
];

const adminLinks = [
  { href: "/admin/admin-dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { href: "/admin/manage-products",   label: "Manage Products", icon: Package         },
  { href: "/admin/manage-orders",     label: "Manage Orders",   icon: ShoppingBag     },
  { href: "/admin/manage-blogs",      label: "Manage Blogs",    icon: BookOpen        },
];

interface AuthUser {
  name: string;
  email: string;
  role: "admin" | "moderator" | "customer";
  avatar?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authUser, setAuthUser]         = useState<AuthUser | null>(null);
  const { totalItems }                  = useCart();
  const pathname                        = usePathname();
  const router                          = useRouter();
  const dropRef                         = useRef<HTMLDivElement>(null);

  // scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // load user from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("authUser");
    if (raw) {
      try { setAuthUser(JSON.parse(raw)); } catch { /* ignore */ }
    }
    const onAuth = () => {
      const r = localStorage.getItem("authUser");
      setAuthUser(r ? JSON.parse(r) : null);
    };
    window.addEventListener("authChange", onAuth);
    return () => window.removeEventListener("authChange", onAuth);
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // close dropdown on route change
  useEffect(() => { setDropdownOpen(false); setMobileOpen(false); }, [pathname]);

  const logout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    document.cookie = "adminToken=; path=/; max-age=0; SameSite=Lax";
    setAuthUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
  };

  const isAdmin  = authUser?.role === "admin" || authUser?.role === "moderator";
  const initials = authUser?.name
    ?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) ?? "U";

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
  <Image
    src="/logo.jpg"
    alt="Dexxozzbd Logo"
    width={36}
    height={36}
    className="rounded-xl group-hover:scale-110 transition-transform"
  />
  <div className="leading-tight">
    <span className="font-heading font-bold text-lg text-white block leading-none">Dexxozzbd</span>
    <span className="text-brand-400 text-xs font-medium font-body">Premium Subscriptions</span>
  </div>
</Link>

          {/* Desktop nav links */}
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

            {/* Search */}
            <button className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
              <Search size={18} />
            </button>

            {/* Cart */}
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

            {/* Auth */}
            {authUser ? (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-brand-500/40 transition-all duration-200"
                >
                  {authUser.avatar ? (
                    <img src={authUser.avatar} alt={authUser.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium font-body max-w-[120px] truncate">
                    {isAdmin
                      ? <span className="text-brand-400">{authUser.email}</span>
                      : <span className="text-slate-200">{authUser.name}</span>
                    }
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* User info */}
                    <div className="px-4 py-3 border-b border-dark-700 bg-dark-900/50">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{authUser.role}</p>
                      <p className="text-sm font-semibold text-white truncate mt-0.5">{authUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{authUser.email}</p>
                    </div>

                    <div className="p-1.5">

                      {/* Admin links — admin/moderator only */}
                      {isAdmin && (
                        <>
                          {adminLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                              key={href}
                              href={href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-brand-500/10 transition-all group"
                            >
                              <Icon size={15} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                              {label}
                            </Link>
                          ))}
                          <div className="my-1 border-t border-dark-700" />
                        </>
                      )}

                      {/* Profile — customers only */}
                      {!isAdmin && (
                        <Link
                          href="/users/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
                        >
                          <User size={15} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                          My Profile
                        </Link>
                      )}

                      {/* Logout */}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                      >
                        <LogOut size={15} className="transition-colors" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold font-body transition-all duration-200 shadow-lg shadow-brand-500/20"
              >
                <User size={15} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

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
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-[500px]" : "max-h-0"}`}>
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

            {/* Mobile search */}
            <div className="mt-2 flex items-center gap-2 px-4 py-3 bg-dark-700 rounded-xl">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="bg-transparent text-sm text-white outline-none flex-1 placeholder-slate-500 font-body"
              />
            </div>

            {/* Mobile auth */}
            {authUser ? (
              <div className="mt-2 bg-dark-700 rounded-xl overflow-hidden">

                {/* User info */}
                <div className="px-4 py-3 border-b border-dark-600 flex items-center gap-3">
                  {authUser.avatar ? (
                    <img src={authUser.avatar} alt={authUser.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{authUser.name}</p>
                    <p className="text-xs text-slate-400">{authUser.email}</p>
                  </div>
                </div>

                {/* Admin links — admin/moderator only */}
                {isAdmin && adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 border-b border-dark-600 transition-all"
                  >
                    <Icon size={15} className="text-slate-500" />
                    {label}
                  </Link>
                ))}

                {/* Profile — customers only */}
                {!isAdmin && (
                  <Link
                    href="/users/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 border-b border-dark-600 transition-all"
                  >
                    <User size={15} className="text-slate-500" />
                    My Profile
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold transition-all"
              >
                <User size={15} />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}