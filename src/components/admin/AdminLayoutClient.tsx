"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayoutClient({
  children,
  adminUser,
}: {
  children: React.ReactNode;
  adminUser: {
    name: string;
    email: string;
    role: string;
  };
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Load user preference for sidebar state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cb_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsDesktopCollapsed(saved === "true");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cb_admin_sidebar_collapsed", String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Off-canvas / Responsive Collapsible Sidebar */}
      <AdminSidebar
        adminRole={adminUser.role}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
        onToggleDesktopCollapse={toggleDesktopCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isDesktopCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <AdminHeader
          adminName={adminUser.name}
          adminEmail={adminUser.email}
          adminRole={adminUser.role}
          onOpenMobile={() => setIsMobileOpen(true)}
          isDesktopCollapsed={isDesktopCollapsed}
          onToggleDesktopCollapse={toggleDesktopCollapse}
        />

        <main className="flex-1 p-3.5 sm:p-5 lg:p-7 max-w-[1600px] w-full mx-auto transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}

