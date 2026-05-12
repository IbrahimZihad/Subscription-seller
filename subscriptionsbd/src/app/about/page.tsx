import Link from "next/link";
import {
  Shield,
  Users,
  Award,
  Zap,
  CheckCircle,
  Star,
  Quote,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

export const metadata = { title: "About Us — Subscriptions BD" };

const milestones = [
  { year: "2020", text: "Subscriptions BD was founded in Dhaka with a mission to make premium digital tools accessible to all Bangladeshis." },
  { year: "2021", text: "Expanded our catalog to 50+ products. Crossed 1,000 happy customers. Launched WhatsApp instant delivery support." },
  { year: "2022", text: "Partnered with additional verified suppliers. Introduced our replacement warranty policy. Reached 5,000 customers." },
  { year: "2023", text: "Launched AI tools category. Crossed 15,000 customers. Became Bangladesh's most-reviewed subscription store." },
  { year: "2024", text: "Expanded to 200+ products. Launched blog for education. 25,000+ happy customers nationwide." },
];

const teamValues = [
  { icon: Shield, title: "Trustworthiness", text: "We build long-term relationships through honesty, transparency, and genuine products." },
  { icon: Zap,    title: "Speed",           text: "Fast delivery isn't just a promise — it's the core of our service commitment." },
  { icon: Users,  title: "Community",       text: "We serve Bangladesh's growing digital community with the tools they need to succeed." },
  { icon: Award,  title: "Quality",         text: "Every account we sell is verified, tested, and backed by our replacement warranty." },
];

export default async function AboutPage() {
  let reviews: any[] = [];

  try {
    const res = await fetchAPI("/reviews?limit=6&sortBy=createdAt&order=DESC");
    if (Array.isArray(res.data)) reviews = res.data;
  } catch (err) {
    console.error("Failed to load reviews:", err);
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Hero */}
        <div className="text-center mb-20">
          <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 font-mono">
            About Us
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            Bangladesh&apos;s Most <span className="gradient-text">Trusted</span>
            <br />Subscription Store
          </h1>
          <p className="text-slate-400 text-lg font-body max-w-2xl mx-auto leading-relaxed">
            Since 2020, Subscriptions BD has been making premium digital subscriptions accessible to every Bangladeshi — with affordable BDT prices, local payments, and instant delivery.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {[
            { value: "25,000+",   label: "Happy Customers",    icon: Users },
            { value: "200+",      label: "Products Available", icon: Zap   },
            { value: "4.9/5",     label: "Average Rating",     icon: Star  },
            { value: "Since 2020", label: "Established",       icon: Award },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="card-dark p-6 text-center">
              <div className="w-12 h-12 bg-brand-500/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-brand-400" />
              </div>
              <p className="font-heading font-extrabold text-3xl gradient-text mb-1">{value}</p>
              <p className="text-slate-400 text-sm font-body">{label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <span className="text-brand-400 text-xs font-bold uppercase tracking-wider mb-3 block font-mono">Our Mission</span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-5">
              Making Premium Digital Tools
              <br /><span className="gradient-text">Accessible to All</span>
            </h2>
            <p className="text-slate-400 mb-6">
              We believe every Bangladeshi should have access to world-class digital tools.
            </p>
            <div className="space-y-3">
              {[
                "100% genuine, verified accounts",
                "Pay with bKash, Nagad, Rocket",
                "Full replacement warranty",
                "24/7 WhatsApp support",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle size={16} className="text-green-400" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <div className="card-dark p-8">
            <h3 className="text-white text-xl font-bold mb-4 text-center">Our Promise</h3>
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews" className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl text-white font-bold">
              What Customers <span className="gradient-text">Say</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <div key={r.id ?? i} className="card-dark p-6">
                  <Quote size={24} className="text-brand-500/30 mb-3" />

                  <p className="text-slate-300 text-sm italic mb-5">
                    &ldquo;{r.body}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-4 border-t border-dark-600">
                    <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(r.reviewerName ?? "A")[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm">{r.reviewerName ?? "Anonymous"}</p>
                      <p className="text-slate-500 text-xs">{r.reviewerRole ?? "Customer"}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: r.rating ?? 5 }).map((_, j) => (
                        <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center col-span-full">
                No reviews available.
              </p>
            )}
          </div>
        </div>

        {/* Developer */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 font-mono">
              Built By
            </span>
            <h2 className="text-3xl text-white font-bold">
              Meet the <span className="gradient-text">Developer</span>
            </h2>
          </div>

          <div className="card-dark p-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              <img
                src="/ibrahim.jpg"
                alt="Md. Ibrahim Zihad"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-brand-500/40"
              />
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-white font-heading font-extrabold text-2xl mb-1">
                Md. Ibrahim Zihad
              </h3>
              <p className="text-brand-400 text-sm font-mono font-bold mb-3">
                Full-Stack Developer
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Designed and built Subscriptions BD from the ground up — including the storefront, admin dashboard, payment integration, and REST API. Passionate about creating fast, scalable web applications with great user experiences.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-5">
                {["Next.js", "Node.js", "PostgreSQL", "Sequelize", "Tailwind CSS"].map((tech) => (
                  <span key={tech} className="bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-mono px-3 py-1 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 justify-center sm:justify-start">
                <a href="https://github.com/IbrahimZihad" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">GitHub →</a>
                <a href="https://linkedin.com/in/ibrahim-zihad-637525317" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">LinkedIn →</a>
                {/* <a href="https://portfolio.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">Portfolio →</a> */}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-10 border rounded-3xl">
          <h2 className="text-white text-2xl mb-3">Ready to get started?</h2>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>

      </div>
    </div>
  );
}