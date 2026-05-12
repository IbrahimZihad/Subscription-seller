import Link from "next/link";
import { Zap, Facebook, Instagram, Twitter, Mail, Phone, MapPin, MessageCircle, Shield, Truck, RefreshCw, Star } from "lucide-react";
import { siteConfig } from "@/lib/data";

const footerLinks = {
  Products: [
    { label: "Streaming", href: "/products?cat=streaming" },
    { label: "AI Tools", href: "/products?cat=ai-tools" },
    { label: "Productivity", href: "/products?cat=productivity" },
    { label: "Design", href: "/products?cat=design" },
    { label: "VPN & Security", href: "/products?cat=vpn" },
    { label: "Education", href: "/products?cat=education" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Reviews", href: "/about#reviews" },
  ],
  Support: [
    { label: "FAQ", href: "/contact#faq" },
    { label: "Refund Policy", href: "/contact#refund" },
    { label: "Privacy Policy", href: "/contact#privacy" },
    { label: "Terms of Service", href: "/contact#terms" },
  ],
};

const trust = [
  { icon: Shield, label: "100% Genuine", sub: "Verified accounts" },
  { icon: Truck, label: "Fast Delivery", sub: "Avg. 30 minutes" },
  { icon: RefreshCw, label: "Replacement", sub: "Full warranty" },
  { icon: Star, label: "25,000+", sub: "Happy customers" },
];

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-600 mt-20">
      {/* Trust badges */}
      <div className="border-b border-dark-600">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trust.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm font-heading">{label}</p>
                <p className="text-slate-400 text-xs font-body">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                <Zap size={22} className="text-white" fill="white" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-white block leading-none">
                  Subscriptions BD
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-body">
              Bangladesh&apos;s most trusted digital subscription store. Get Netflix, ChatGPT, Spotify, and 200+ premium tools at the best prices — paid with bKash, Nagad, or Rocket.
            </p>
            {/* Contact */}
            <div className="space-y-2.5">
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2.5 text-slate-400 hover:text-brand-400 transition-colors text-sm font-body">
                <Phone size={15} className="text-brand-500" />
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2.5 text-slate-400 hover:text-brand-400 transition-colors text-sm font-body">
                <Mail size={15} className="text-brand-500" />
                {siteConfig.email}
              </a>
              <span className="flex items-center gap-2.5 text-slate-400 text-sm font-body">
                <MapPin size={15} className="text-brand-500" />
                {siteConfig.address}
              </span>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              <a href={siteConfig.facebook} target="_blank" rel="noopener" className="w-9 h-9 bg-dark-700 hover:bg-brand-500/20 border border-dark-600 hover:border-brand-500/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-400 transition-all">
                <Facebook size={16} />
              </a>
              <a href={siteConfig.instagram} target="_blank" rel="noopener" className="w-9 h-9 bg-dark-700 hover:bg-brand-500/20 border border-dark-600 hover:border-brand-500/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-400 transition-all">
                <Instagram size={16} />
              </a>
              <a href={siteConfig.twitter} target="_blank" rel="noopener" className="w-9 h-9 bg-dark-700 hover:bg-brand-500/20 border border-dark-600 hover:border-brand-500/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-400 transition-all">
                <Twitter size={16} />
              </a>
              <a href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="w-9 h-9 bg-green-500/15 hover:bg-green-500/30 border border-green-500/20 rounded-lg flex items-center justify-center text-green-400 transition-all">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-brand-400 text-sm transition-colors font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-dark-600 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs font-body">
          <p>© 2025 Subscriptions BD. All rights reserved.</p>
          <p>Payments via bKash · Nagad · Rocket · Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
