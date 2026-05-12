import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "@/types";

interface Props {
  post: BlogPost;
}

export default function BlogCard({ post }: Props) {
  return (
    <div className="card-dark group flex flex-col h-full product-card">
      {/* Image */}
      <div className="relative overflow-hidden aspect-video">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />
        <span className="absolute top-3 left-3 bg-brand-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-slate-500 text-xs mb-3 font-body">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {new Date(post.date).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>

        <h3 className="font-heading font-bold text-white text-base leading-snug mb-2 group-hover:text-brand-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3 font-body flex-1">
          {post.excerpt}
        </p>

        {/* Author + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-600">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500/20 rounded-full flex items-center justify-center">
              <span className="text-brand-400 text-xs font-bold">S</span>
            </div>
            <span className="text-slate-400 text-xs font-body">{post.author}</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors font-body group/link"
          >
            Read more
            <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
