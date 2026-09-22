import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — middleware already protects /admin/*, this covers direct server rendering too.
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <div className="flex-1 pb-20 sm:pb-0">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
