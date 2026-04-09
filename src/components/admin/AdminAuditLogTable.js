"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function parseAuditDetails(details) {
  if (!details) return null;
  if (typeof details !== "string") return details;

  try {
    return JSON.parse(details);
  } catch {
    return details;
  }
}

function formatActionLabel(action) {
  return String(action || "")
    .split(".")
    .map((part) => part.replaceAll("_", " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function formatEntityLabel(entityType) {
  return String(entityType || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatScalarValue(value) {
  if (value == null || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function buildDetailLines(details) {
  if (!details) return ["No details captured."];

  if (details.before && details.after) {
    const keys = Array.from(new Set([...Object.keys(details.before || {}), ...Object.keys(details.after || {})]));
    const changedKeys = keys.filter((key) => JSON.stringify(details.before?.[key]) !== JSON.stringify(details.after?.[key]));

    if (!changedKeys.length) {
      return ["Saved with no field-level changes captured."];
    }

    return changedKeys.map((key) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
      return `${label}: ${formatScalarValue(details.before?.[key])} -> ${formatScalarValue(details.after?.[key])}`;
    });
  }

  if (details.question) {
    return [
      `Section: ${formatScalarValue(details.section?.title || details.section?.key)}`,
      `Question: ${formatScalarValue(details.question.prompt)}`,
      `Section ID: ${formatScalarValue(details.question.sectionId)}`,
      `Weight: ${formatScalarValue(details.question.weight)}`,
      `Sort order: ${formatScalarValue(details.question.sortOrder)}`,
      `Active: ${formatScalarValue(details.question.isActive)}`,
    ];
  }

  if (details.section) {
    return [
      `Section: ${formatScalarValue(details.section.title)}`,
      `Key: ${formatScalarValue(details.section.key)}`,
      `Weight: ${formatScalarValue(details.section.weight)}`,
      `Sort order: ${formatScalarValue(details.section.sortOrder)}`,
      `Active: ${formatScalarValue(details.section.isActive)}`,
    ];
  }

  return Object.entries(details).map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
    if (typeof value === "object" && value !== null) {
      return `${label}: ${JSON.stringify(value)}`;
    }
    return `${label}: ${formatScalarValue(value)}`;
  });
}

function AuditLogRow({ entry }) {
  const details = parseAuditDetails(entry.details);
  const lines = buildDetailLines(details);

  return (
    <tr className="align-top">
      <td className="px-3 py-4 whitespace-nowrap text-slate-600">
        <div>{new Date(entry.createdAt).toLocaleDateString()}</div>
        <div className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleTimeString()}</div>
      </td>
      <td className="px-3 py-4 text-slate-700">
        <div className="font-medium text-slate-950">{entry.actorEmail || "System"}</div>
        <div className="text-xs uppercase tracking-[0.14em] text-slate-400">{entry.actorType}</div>
      </td>
      <td className="px-3 py-4 text-slate-700">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{formatActionLabel(entry.action)}</span>
      </td>
      <td className="px-3 py-4 text-slate-700">
        <div className="font-medium text-slate-950">{formatEntityLabel(entry.entityType)}</div>
        <div className="mt-1 break-all text-xs text-slate-400">{entry.entityId}</div>
      </td>
      <td className="px-3 py-4 text-slate-700">
        <div className="space-y-1">
          {lines.map((line) => (
            <div key={line} className="leading-6 text-slate-600">
              {line}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}

export default function AdminAuditLogTable({ auditLogs, className = "" }) {
  return (
    <Card className={`border border-slate-200/80 bg-white shadow-sm ${className}`.trim()}>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>Tracks admin access, framework changes, settings updates, report actions, and assessment saves with field-level detail.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3">Actor</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Entity</th>
                <th className="px-3 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs?.length ? (
                auditLogs.map((entry) => <AuditLogRow key={entry.id} entry={entry} />)
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                    No audit activity captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
