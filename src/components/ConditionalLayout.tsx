"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide public website header and footer on dashboard workspaces (/employer/* and /admin/*)
  const isWorkspaceRoute =
    pathname.startsWith("/employer/") ||
    pathname === "/employer" ||
    pathname.startsWith("/admin/") ||
    pathname === "/admin";

  if (isWorkspaceRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
