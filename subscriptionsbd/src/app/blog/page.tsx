import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";

import { fetchAPI } from "@/lib/api";

export const metadata = { title: "Blog — Subscriptions BD" };

const cats = ["All", "Guide", "Comparison", "Review", "List"];

// -----------------------------
// API
// -----------------------------
async function getBlogs() {
  try {
    const res = await fetchAPI(`/blog`);

    // ✅ handle multiple backend formats safely
    const data =
      res?.data || res?.blogs || res?.posts || res;

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// -----------------------------
// Page
// -----------------------------
export default async function BlogPage() {
  const blogPosts = await getBlogs();

  const posts = Array.isArray(blogPosts) ? blogPosts : [];

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4 font-mono">
            Blog
          </span>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-white mb-4">
            Guides, Tips & <span className="gradient-text">Reviews</span>
          </h1>

          <p className="text-slate-400 font-body max-w-xl mx-auto">
            Everything you need to know about digital subscriptions in Bangladesh — buying guides, comparisons, and honest reviews.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search blog posts..."
              className="w-full bg-dark-800 border border-dark-600 text-white rounded-xl pl-10 py-3 text-sm outline-none font-body"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {cats.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition font-body ${
                  cat === "All"
                    ? "bg-brand-500 text-white"
                    : "bg-dark-700 border border-dark-600 text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* If no posts */}
        {!featured && (
          <div className="text-center text-slate-400">
            No blog posts found.
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
            <div className="card-dark overflow-hidden grid md:grid-cols-2 hover:border-brand-500/30 transition-all">

              <div className="relative aspect-video md:aspect-auto md:min-h-64 overflow-hidden">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />

                <span className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-mono">
                  ✨ Featured
                </span>
              </div>

              <div className="p-8 flex flex-col justify-center">
                <span className="text-brand-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
                  {featured.category}
                </span>

                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-4 group-hover:text-brand-300 transition">
                  {featured.title}
                </h2>

                <p className="text-slate-400 font-body mb-6">
                  {featured.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-500 text-sm font-body">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(featured.date).toLocaleDateString("en-BD")}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {featured.readTime}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-brand-400 font-medium text-sm group-hover:gap-2 transition-all">
                    Read <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post: any) => (
            <Link
              key={post._id || post.id}
              href={`/blog/${post.slug}`}
              className="card-dark group flex flex-col hover:border-brand-500/30 transition"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />

                <span className="absolute top-3 left-3 bg-brand-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
                  {post.category}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-slate-500 text-xs mb-3 font-body">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(post.date).toLocaleDateString()}
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-white mb-2 group-hover:text-brand-300 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-400 text-sm line-clamp-2 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-1 text-brand-400 text-xs font-medium mt-4">
                  Read more <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}