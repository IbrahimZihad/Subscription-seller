import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-heading font-extrabold text-9xl gradient-text mb-4">404</p>
        <h1 className="font-heading font-bold text-white text-3xl mb-3">Page Not Found</h1>
        <p className="text-slate-400 font-body mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back to the shop!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary flex items-center justify-center gap-2">
            Go Home <ArrowRight size={16} />
          </Link>
          <Link href="/products" className="btn-outline">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
