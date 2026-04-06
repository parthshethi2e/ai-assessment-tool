import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminLoggedIn } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin Login",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const loggedIn = await isAdminLoggedIn();

  if (loggedIn) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}
