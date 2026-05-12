"use client";
import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, Clock, Send, CheckCircle, ChevronDown } from "lucide-react";
import { siteConfig } from "@/lib/data";

const faqs = [
  { q: "How do I receive my subscription?", a: "After payment confirmation, we deliver your subscription credentials via WhatsApp and email within 10-30 minutes (up to 24 hours for some products)." },
  { q: "What payment methods do you accept?", a: "We accept bKash, Nagad, Rocket, and direct bank transfer. No international card required!" },
  { q: "Are the accounts genuine and safe?", a: "Yes, all our subscriptions are 100% authentic sourced from verified suppliers. We never sell cracked or fake accounts." },
  { q: "What if my subscription stops working?", a: "We offer a full replacement warranty. If your account stops working during the subscription period, we replace it immediately — no questions asked." },
  { q: "Can I buy subscriptions for my family or team?", a: "Absolutely! Many of our plans support multiple devices. Contact us on WhatsApp for bulk orders and custom packages." },
  { q: "How long does delivery take?", a: "Most orders are delivered within 10-30 minutes. Some products may take up to 24 hours. We'll notify you via WhatsApp." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 font-mono">
            Contact Us
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-white mb-4">
            We&apos;re Here to <span className="gradient-text">Help</span>
          </h1>
          <p className="text-slate-400 font-body max-w-xl mx-auto">
            Have a question or need help with your order? Reach out anytime — we&apos;re available 24/7.
          </p>
        </div>

        {/* Quick contacts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: siteConfig.whatsapp,
              sub: "Fastest response",
              href: `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`,
              color: "text-green-400",
              bg: "bg-green-400/10",
            },
            {
              icon: Mail,
              label: "Email",
              value: siteConfig.email,
              sub: "Reply within 2 hours",
              href: `mailto:${siteConfig.email}`,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              icon: Phone,
              label: "Phone",
              value: siteConfig.phone,
              sub: "10AM–10PM BD",
              href: `tel:${siteConfig.phone}`,
              color: "text-brand-400",
              bg: "bg-brand-400/10",
            },
            {
              icon: Clock,
              label: "Support Hours",
              value: "24/7 Available",
              sub: "WhatsApp always on",
              href: null,
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
          ].map(({ icon: Icon, label, value, sub, href, color, bg }) => {
            const Wrapper = href ? "a" : "div";
            return (
              <Wrapper
                key={label}
                {...(href ? { href, target: "_blank", rel: "noopener" } : {})}
                className="card-dark p-5 flex items-start gap-4 hover:border-brand-500/30 transition-all group"
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-body mb-0.5">{label}</p>
                  <p className={`font-heading font-bold text-sm ${color}`}>{value}</p>
                  <p className="text-slate-500 text-xs font-body">{sub}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-20">
          {/* Form */}
          <div>
            <h2 className="font-heading font-bold text-white text-2xl mb-6">Send us a Message</h2>

            {sent ? (
              <div className="card-dark p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-2">Message Sent!</h3>
                <p className="text-slate-400 font-body">We&apos;ll get back to you within 2 hours. For faster response, reach us on WhatsApp!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                    { key: "phone", label: "Phone (WhatsApp)", type: "tel", placeholder: "+880 1XXX-XXXXXX" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-slate-400 text-sm mb-1.5 font-body">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        required
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500/50 text-white rounded-xl px-4 py-3 text-sm outline-none font-body"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-body">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500/50 text-white rounded-xl px-4 py-3 text-sm outline-none font-body"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-body">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 text-slate-300 rounded-xl px-4 py-3 text-sm outline-none font-body cursor-pointer"
                  >
                    <option value="">Select subject...</option>
                    <option>Order Issue</option>
                    <option>Account Problem</option>
                    <option>Payment Help</option>
                    <option>Product Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-body">Message</label>
                  <textarea
                    placeholder="Describe your issue or question..."
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-dark-800 border border-dark-600 focus:border-brand-500/50 text-white rounded-xl px-4 py-3 text-sm outline-none font-body resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center">
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Map placeholder + info */}
          <div>
            <h2 className="font-heading font-bold text-white text-2xl mb-6">Find Us</h2>
            <div className="card-dark rounded-2xl overflow-hidden mb-6 aspect-video flex items-center justify-center bg-dark-700">
              <div className="text-center">
                <MapPin size={40} className="text-brand-400 mx-auto mb-3" />
                <p className="text-white font-heading font-bold">Dhaka, Bangladesh</p>
                <p className="text-slate-400 text-sm font-body">Online store — deliver nationwide</p>
              </div>
            </div>

            <div className="card-dark p-6">
              <h3 className="font-heading font-bold text-white mb-4">Quick Tip</h3>
              <p className="text-slate-400 text-sm font-body leading-relaxed mb-4">
                For the fastest response, message us on <strong className="text-green-400">WhatsApp</strong>. We typically reply within 5–10 minutes, even late at night!
              </p>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all font-body w-full"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat on WhatsApp Now
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq">
          <div className="text-center mb-10">
            <h2 className="font-heading font-extrabold text-3xl text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card-dark overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-heading font-bold text-white pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-brand-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                  <p className="px-5 pb-5 text-slate-400 text-sm font-body leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
