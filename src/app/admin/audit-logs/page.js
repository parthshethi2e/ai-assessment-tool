import Link from "next/link";
import { Button } from "@/components/ui/button";
import BrandBadge from "@/components/BrandBadge";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminAuditLogTable from "@/components/admin/AdminAuditLogTable";
import { requireAdminPageSession } from "@/lib/adminAuth";
import { getAuditEvents } from "@/lib/auditLog";

export const metadata = {
  title: "Admin Audit Logs",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const session = await requireAdminPageSession();
  const auditLogs = await getAuditEvents(300);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <BrandBadge subtitle="Audit and activity history" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Admin module</p>
            <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-slate-950">I2E Consulting audit logs</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Review every major platform action in one place, including admin sign-ins, framework edits, report changes, and assessment saves.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
              {session.adminUser.email}
            </div>
            <AdminLogoutButton />
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin">Back to admin</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/reports">View reports</Link>
            </Button>
          </div>
        </div>

        <AdminAuditLogTable auditLogs={auditLogs} />
      </div>
    </div>
  );
}
