import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandBadge from "@/components/BrandBadge";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminAuditLogTable from "@/components/admin/AdminAuditLogTable";
import { requireAdminPageSession } from "@/lib/adminAuth";
import { getAuditEvents } from "@/lib/auditLog";
import { isSuperAdmin } from "@/lib/adminUsers";

function getAdminDisplayName(adminUser) {
  return [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(" ") || adminUser?.email || "Admin";
}

export const metadata = {
  title: "Admin Audit Logs",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const session = await requireAdminPageSession();

  if (!isSuperAdmin(session.adminUser)) {
    redirect("/admin");
  }

  const auditLogs = await getAuditEvents(300);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <div className="w-full px-5 py-10 sm:px-6 lg:px-10">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
          <div className="relative bg-slate-950 px-6 py-7 text-white lg:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.28),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(38,153,245,0.22),transparent_22%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:54px_54px] opacity-70" />
            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-3xl">
                <BrandBadge dark subtitle="Audit and activity history" />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Admin module</p>
                <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight text-white lg:text-5xl">I2E Consulting audit logs</h1>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Review every major platform action in one place, including admin sign-ins, framework edits, report changes, and assessment saves.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                    <UserRound className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{getAdminDisplayName(session.adminUser)}</div>
                    <div className="mt-1 text-xs text-slate-300">{session.adminUser?.role === "super_admin" ? "Super admin access" : "Admin access"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-8">
            <div className="flex flex-wrap gap-3">
              <AdminActionLink href="/admin" icon={ArrowLeft} label="Back to admin" />
              <AdminActionLink href="/admin/profile" icon={ShieldCheck} label="Admin profile" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-10 rounded-full px-5">
                <Link href="/reports">
                  <FileText className="size-4" />
                  View reports
                </Link>
              </Button>
              <AdminLogoutButton />
            </div>
          </div>
        </div>

        <AdminAuditLogTable auditLogs={auditLogs} />
      </div>
    </div>
  );
}

function AdminActionLink({ href, icon: Icon, label }) {
  return (
    <Button asChild variant="outline" className="h-10 rounded-full border-slate-200 bg-slate-50 px-4 text-slate-700 hover:bg-white">
      <Link href={href}>
        <Icon className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
