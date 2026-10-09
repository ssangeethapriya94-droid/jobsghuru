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

  if (!admin) {
    // Show standalone login screen without sidebar on /admin/login
    if (pathname === "/admin/login") {
      return <>{children}</>;
    }
    // Redirect unauthenticated / invalid admin session access to admin login page
    redirect("/admin/login");
  }

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
