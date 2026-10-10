import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { headers } from "next/headers";

export const metadata = {
  title: "Admin Portal | JobsGhuru Enterprise",
  robots: "noindex, nofollow",
};

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // If user is not logged in AND visiting /admin/login, render standalone login screen without sidebar
  if (!admin) {
    if (pathname === "/admin/login" || pathname.endsWith("/admin/login")) {
      return <>{children}</>;
    }
    redirect("/admin/login");
  }

  // Authenticated admin: Always render AdminLayoutClient (with Sidebar + Header)
  return (
    <AdminLayoutClient
      adminUser={{
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}


