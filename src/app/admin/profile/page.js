import AdminProfileManager from "@/components/admin/AdminProfileManager";
import { requireAdminPageSession } from "@/lib/adminAuth";
import { getAdminUserById, getAdminUsers, isSuperAdmin } from "@/lib/adminUsers";

export const metadata = {
  title: "Admin Profile",
};

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await requireAdminPageSession();
  const canManageAdmins = isSuperAdmin(session.adminUser);
  const users = canManageAdmins ? await getAdminUsers() : [await getAdminUserById(session.adminUser.id)];

  return <AdminProfileManager canManageAdmins={canManageAdmins} currentAdminId={session.adminUser.id} initialUsers={users.filter(Boolean)} />;
}
