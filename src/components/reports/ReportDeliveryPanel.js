"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ReportDeliveryPanel({ reportId, initialStatus, initialNotes, deliveredAt, deliveredByEmail, canManage }) {
  const router = useRouter();
  const [deliveryStatus, setDeliveryStatus] = useState(initialStatus || "pending");
  const [deliveryNotes, setDeliveryNotes] = useState(initialNotes || "");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleSave = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryStatus,
          deliveryNotes,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to save delivery details.");
      }

      setToast({ type: "success", message: "Delivery details saved." });
      router.refresh();
    } catch (error) {
      console.error(error);
      setToast({ type: "error", message: error.message || "Unable to save delivery details." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border border-slate-200/80 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Delivery status</CardTitle>
          <CardDescription>Track whether the I2E Consulting report has been delivered for this assessment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!canManage}
              onClick={() => setDeliveryStatus("pending")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                deliveryStatus === "pending" ? "border-amber-300 bg-amber-50 text-amber-950" : "border-slate-200 bg-slate-50 text-slate-700"
              } ${!canManage ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="size-4" />
                Pending delivery
              </div>
              <div className="mt-1 text-xs text-slate-500">Report is prepared but not yet marked as delivered.</div>
            </button>

            <button
              type="button"
              disabled={!canManage}
              onClick={() => setDeliveryStatus("delivered")}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                deliveryStatus === "delivered" ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-slate-200 bg-slate-50 text-slate-700"
              } ${!canManage ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="size-4" />
                Delivered
              </div>
              <div className="mt-1 text-xs text-slate-500">Mark this report as delivered to the client or stakeholder.</div>
            </button>
          </div>

          <Textarea
            value={deliveryNotes}
            onChange={(event) => setDeliveryNotes(event.target.value)}
            disabled={!canManage}
            placeholder="Add delivery notes, stakeholder name, handoff method, or context."
          />

          {deliveredAt ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Delivered on {new Date(deliveredAt).toLocaleString()} {deliveredByEmail ? `by ${deliveredByEmail}` : ""}
            </div>
          ) : null}

          {canManage ? (
            <Button className="rounded-full" disabled={submitting} onClick={handleSave}>
              {submitting ? "Saving..." : "Save delivery status"}
            </Button>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Log in as an admin consultant to update delivery status.
            </div>
          )}
        </CardContent>
      </Card>

      <ToastBanner toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

function ToastBanner({ toast, onClose }) {
  if (!toast) return null;

  const tone =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-xl ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{toast.message}</p>
        <button type="button" className="opacity-70 transition hover:opacity-100" onClick={onClose} aria-label="Close toast">
          ×
        </button>
      </div>
    </div>
  );
}
