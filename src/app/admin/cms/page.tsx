import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/auth";
import AdminCmsView from "@/components/admin/AdminCmsView";

export const metadata = {
  title: "Website Pages CMS | JobsGhuru Admin",
};

export default async function AdminCmsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminCmsView />;
}
