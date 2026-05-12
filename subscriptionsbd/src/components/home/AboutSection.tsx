import { Shield, Zap, RefreshCw, Headphones, CreditCard, Award } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Genuine Accounts",
    description:
      "We source all subscriptions from official channels. No cracked or fake accounts — guaranteed authentic access every time.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Most orders are delivered within 10–30 minutes. Some products may take up to 24 hours during peak times.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: RefreshCw,
    title: "Full Replacement Warranty",
    description:
      "If your subscription stops working, we replace it immediately — no questions asked. Your satisfaction is guaranteed.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: CreditCard,
    title: "Local BDT Payments",
    description:
      "Pay easily with bKash, Nagad, Rocket, or direct bank transfer. No international card required.",
    color: "text-brand-400",
    bg: "bg-brand-400/10",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description:
      "Our dedicated support team is available every day via WhatsApp, Facebook, and email to help you instantly.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Award,
    title: "Best Price in Bangladesh",
    description:
      "We guarantee the lowest prices for premium subscriptions in Bangladesh — no hidden fees, no surprises.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
];

export default function AboutSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 stripe-accent opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 font-mono">
            Why Subscriptions BD?
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Bangladesh&apos;s Most{" "}
            <span className="gradient-text">Trusted</span> Digital Store
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-body leading-relaxed">
            Since 2020, we&apos;ve helped over 25,000 Bangladeshis access premium digital subscriptions
            at affordable local prices — with the service quality you deserve.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="card-dark p-6 hover:border-brand-500/30 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-body">{description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-14 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-brand-500/10 border border-brand-500/20 rounded-3xl p-8 text-center">
          <h3 className="font-heading font-bold text-white text-2xl mb-2">
            Ready to get your subscription?
          </h3>
          <p className="text-slate-400 font-body mb-6">
            Join 25,000+ Bangladeshis enjoying premium digital services at the best prices.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/products" className="btn-primary">
              Shop Now
            </a>
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-semibold px-6 py-3 rounded-xl transition-all font-body"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
