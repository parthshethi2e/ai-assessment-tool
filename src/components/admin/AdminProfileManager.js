"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserPlus } from "lucide-react";
import BrandBadge from "@/components/BrandBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const emptyNewAdmin = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  mobileNumber: "",
  designation: "",
  department: "",
  role: "admin",
  notes: "",
  isActive: true,
};

function toDraft(user) {
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    mobileNumber: user.mobileNumber || "",
    designation: user.designation || "",
    department: user.department || "",
    role: user.role || "admin",
    notes: user.notes || "",
    isActive: user.isActive !== false,
  };
}

export default function AdminProfileManager({ canManageAdmins, currentAdminId, initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [drafts, setDrafts] = useState(() => Object.fromEntries(initialUsers.map((user) => [user.id, toDraft(user)])));
  const [newAdmin, setNewAdmin] = useState(emptyNewAdmin);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [savingId, setSavingId] = useState("");
  const [creating, setCreating] = useState(false);

  const setMessage = (message) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 3500);
  };

  const validateProfile = (draft) => {
    if (!draft.firstName?.trim() || !draft.lastName?.trim()) {
      return "First name and last name are required.";
    }

    return "";
  };

  const saveUser = async (userId) => {
    const draft = drafts[userId];
    const validationError = validateProfile(draft);

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSavingId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to update admin profile.");
      }

      setUsers((current) => current.map((user) => (user.id === userId ? json.user : user)));
      setDrafts((current) => ({ ...current, [userId]: toDraft(json.user) }));
      setMessage("Admin profile updated.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to update admin profile.");
    } finally {
      setSavingId("");
    }
  };

  const createUser = async () => {
    const nextErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdmin.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (newAdmin.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!newAdmin.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!newAdmin.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setCreating(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to create admin user.");
      }

      setUsers((current) => [...current, json.user]);
      setDrafts((current) => ({ ...current, [json.user.id]: toDraft(json.user) }));
      setNewAdmin(emptyNewAdmin);
      setErrors({});
      setMessage("New admin user created.");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to create admin user.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <BrandBadge subtitle="Admin profile and access control" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
              {canManageAdmins ? "Admin users" : "Your profile"}
            </p>
            <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              {canManageAdmins ? "Manage admin access" : "Admin profile"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {canManageAdmins
                ? "Admin login is verified against active users stored in the database. Use this page to maintain profile details and add more administrators later."
                : "Your admin login is verified against the database. You can maintain your profile details here; admin user management is reserved for the super admin."}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin">
              <ArrowLeft className="size-4" />
              Back to admin
            </Link>
          </Button>
        </div>

        {status ? <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">{status}</div> : null}

        <div className={`grid gap-6 ${canManageAdmins ? "xl:grid-cols-[minmax(0,1fr)_420px]" : ""}`}>
          <div className="space-y-5">
            {users.map((user) => (
              <Card key={user.id} className="border border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    <ShieldCheck className="size-5 text-cyan-700" />
                    {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email}
                    {user.id === currentAdminId ? <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">You</span> : null}
                    {!user.isActive ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Inactive</span> : null}
                  </CardTitle>
                  <CardDescription>
                    {user.email} {user.lastLoginAt ? `• Last login ${new Date(user.lastLoginAt).toLocaleString()}` : "• No login recorded yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="First name">
                      <Input value={drafts[user.id]?.firstName || ""} onChange={(event) => updateDraft(setDrafts, user.id, { firstName: event.target.value })} />
                    </Field>
                    <Field label="Last name">
                      <Input value={drafts[user.id]?.lastName || ""} onChange={(event) => updateDraft(setDrafts, user.id, { lastName: event.target.value })} />
                    </Field>
                    <Field label="Mobile number">
                      <Input value={drafts[user.id]?.mobileNumber || ""} onChange={(event) => updateDraft(setDrafts, user.id, { mobileNumber: event.target.value })} />
                    </Field>
                    <Field label="Designation">
                      <Input value={drafts[user.id]?.designation || ""} onChange={(event) => updateDraft(setDrafts, user.id, { designation: event.target.value })} />
                    </Field>
                    <Field label="Department">
                      <Input value={drafts[user.id]?.department || ""} onChange={(event) => updateDraft(setDrafts, user.id, { department: event.target.value })} />
                    </Field>
                    <Field label="Role">
                      <Input
                        disabled={!canManageAdmins || user.email === "admin@i2econsulting.com"}
                        value={drafts[user.id]?.role || "admin"}
                        onChange={(event) => updateDraft(setDrafts, user.id, { role: event.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <Textarea value={drafts[user.id]?.notes || ""} onChange={(event) => updateDraft(setDrafts, user.id, { notes: event.target.value })} />
                  </Field>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={drafts[user.id]?.isActive !== false}
                        disabled={!canManageAdmins || user.id === currentAdminId || user.email === "admin@i2econsulting.com"}
                        onChange={(event) => updateDraft(setDrafts, user.id, { isActive: event.target.checked })}
                      />
                      Active admin account
                    </label>
                    <Button className="rounded-full" disabled={savingId === user.id} onClick={() => saveUser(user.id)}>
                      {savingId === user.id ? "Saving..." : "Save profile"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {canManageAdmins ? (
          <Card className="h-fit border border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-cyan-700" />
                Add admin
              </CardTitle>
              <CardDescription>Create a database-backed admin account. The new user can log in once active.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Email">
                <Input
                  type="email"
                  aria-invalid={Boolean(errors.email)}
                  value={newAdmin.email}
                  onChange={(event) => {
                    setNewAdmin((current) => ({ ...current, email: event.target.value }));
                    setErrors((current) => ({ ...current, email: "" }));
                  }}
                />
                <FieldError message={errors.email} />
              </Field>
              <Field label="Temporary password">
                <Input
                  type="password"
                  aria-invalid={Boolean(errors.password)}
                  value={newAdmin.password}
                  onChange={(event) => {
                    setNewAdmin((current) => ({ ...current, password: event.target.value }));
                    setErrors((current) => ({ ...current, password: "" }));
                  }}
                />
                <FieldError message={errors.password} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Field label="First name">
                  <Input
                    aria-invalid={Boolean(errors.firstName)}
                    value={newAdmin.firstName}
                    onChange={(event) => {
                      setNewAdmin((current) => ({ ...current, firstName: event.target.value }));
                      setErrors((current) => ({ ...current, firstName: "" }));
                    }}
                  />
                  <FieldError message={errors.firstName} />
                </Field>
                <Field label="Last name">
                  <Input
                    aria-invalid={Boolean(errors.lastName)}
                    value={newAdmin.lastName}
                    onChange={(event) => {
                      setNewAdmin((current) => ({ ...current, lastName: event.target.value }));
                      setErrors((current) => ({ ...current, lastName: "" }));
                    }}
                  />
                  <FieldError message={errors.lastName} />
                </Field>
              </div>
              <Field label="Mobile number">
                <Input value={newAdmin.mobileNumber} onChange={(event) => setNewAdmin((current) => ({ ...current, mobileNumber: event.target.value }))} />
              </Field>
              <Field label="Designation">
                <Input value={newAdmin.designation} onChange={(event) => setNewAdmin((current) => ({ ...current, designation: event.target.value }))} />
              </Field>
              <Field label="Department">
                <Input value={newAdmin.department} onChange={(event) => setNewAdmin((current) => ({ ...current, department: event.target.value }))} />
              </Field>
              <Field label="Notes">
                <Textarea value={newAdmin.notes} onChange={(event) => setNewAdmin((current) => ({ ...current, notes: event.target.value }))} />
              </Field>
              <Button className="w-full rounded-full" disabled={creating} onClick={createUser}>
                {creating ? "Creating..." : "Create admin user"}
              </Button>
            </CardContent>
          </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function updateDraft(setDrafts, userId, patch) {
  setDrafts((current) => ({
    ...current,
    [userId]: {
      ...current[userId],
      ...patch,
    },
  }));
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      {children}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-sm text-rose-600">{message}</p>;
}
