"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Allow login page through
    if (pathname === "/admin/login") {
      setVerified(true);
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // Verify token is still valid against the backend
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.data?.role || !["admin", "moderator"].includes(data.data.role)) {
          localStorage.removeItem("adminToken");
          router.replace("/admin/login");
        } else {
          setVerified(true);
        }
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  if (!verified) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Verifying access…</div>
      </div>
    );
  }

  return <div className="pt-24">{children}</div>;
}