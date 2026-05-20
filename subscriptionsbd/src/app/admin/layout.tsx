"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Auth check response:", data); // remove after debugging
        const role = data?.user?.role;
        if (!role || !["admin", "moderator"].includes(role)) {
          localStorage.removeItem("adminToken");
          document.cookie = "adminToken=; path=/; max-age=0; SameSite=Lax";
          router.replace("/auth/login");
        } else {
          setVerified(true);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err); // remove after debugging
        localStorage.removeItem("adminToken");
        document.cookie = "adminToken=; path=/; max-age=0; SameSite=Lax";
        router.replace("/auth/login");
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