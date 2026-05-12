import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Tag, ArrowRight } from "lucide-react";

import { fetchAPI } from "@/lib/api";

// -----------------------------
// API HELPERS
// -----------------------------
async function getPost(slug: string) {
  try {
    const res = await fetchAPI(`/blog/${slug}`);
    return res?.data || res || null;
  } catch {
    return null;
  }
}

async function getRelatedPosts(slug: string) {
  try {
    const res = await fetchAPI(`/blog/related/${slug}`);
    const data = res?.data || res?.blogs || res?.posts || res;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getAllBlogs() {
  try {
    const res = await fetchAPI(`/blog`);
    const data = res?.data || res?.blogs || res?.posts || res;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// -----------------------------
// STATIC PARAMS
// -----------------------------
export async function generateStaticParams() {
  const posts = await getAllBlogs();

  if (!Array.isArray(posts)) return [];

  return posts.map((p: any) => ({
    slug: p.slug,
  }));
}

// -----------------------------
// PAGE
// -----------------------------
export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) notFound();

  const related = await getRelatedPosts(params.slug);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-dark-900">
      <div className="max-w-4xl mx-auto px-4">

        {/* Back */}
        <Link
          href="/blog"
          className="flex items-center gap-2 text-slate-400 hover:text-brand-400 mb-8 text-sm"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* Hero Image */}
        <div className="relative aspect-video rounded-3xl overflow-hidden mb-8 card-dark">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />

          <span className="absolute top-4 left-4 bg-brand-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
            {post.category}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-slate-500 text-sm mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {new Date(post.date).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>

          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {post.readTime}
          </span>

          <span className="text-brand-400 font-medium">
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl sm:text-4xl font-extrabold mb-6">
          {post.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {post.tags?.map((tag: string) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-dark-700 border border-dark-600 text-slate-400 text-xs px-3 py-1.5 rounded-lg"
            >
              <Tag size={11} />
              {tag}
            </span>
          ))}
        </div>

        {/* CONTENT (HTML RENDER FIX) */}
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-brand-500/10 to-brand-600/5 border border-brand-500/20 rounded-2xl p-6">
          <h3 className="text-white text-xl font-bold mb-2">
            Ready to buy your subscription?
          </h3>

          <p className="text-slate-400 text-sm mb-4">
            Get genuine subscriptions at the best price in Bangladesh.
          </p>

          <Link href="/products" className="btn-primary inline-flex gap-2">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>

        {/* Related Posts */}
        {Array.isArray(related) && related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-white text-2xl font-bold mb-6">
              Related Posts
            </h2>

            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((r: any) => (
                <Link
                  key={r._id || r.id}
                  href={`/blog/${r.slug}`}
                  className="card-dark group overflow-hidden"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={r.image}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="text-white text-sm font-bold line-clamp-2 group-hover:text-brand-300">
                      {r.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}