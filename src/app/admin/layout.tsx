import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

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

  // If not authenticated as an admin, the individual pages or middleware redirect
  // But for the shell, if logged in, render the full admin dashboard wrapper
  if (!admin) {
    return <>{children}</>;
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
