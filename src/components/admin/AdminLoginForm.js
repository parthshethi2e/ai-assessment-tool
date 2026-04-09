"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Shield } from "lucide-react";
import BrandBadge from "@/components/BrandBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@i2econsulting.com");
  const [password, setPassword] = useState("Admin@123");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        setStatus(json.error || "Login failed.");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("Login failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#edf3f7_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="space-y-6">
            <BrandBadge subtitle="Secure administration portal" />
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900">
              <Shield className="size-4" />
              Protected admin access
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-5xl font-semibold tracking-tight text-slate-950">I2E Consulting admin login</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Sign in to manage the I2E Consulting assessment framework, edit sections and questions, and review reporting activity. Sessions automatically time out after inactivity.
              </p>
            </div>
          </div>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="size-5 text-cyan-700" />
                Admin sign in
              </CardTitle>
              <CardDescription>Use the configured credentials to access the I2E Consulting control center.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="grid gap-2 text-sm font-medium text-slate-800">
                  <span>Email</span>
                  <Input
                    type="email"
                    aria-invalid={Boolean(errors.email)}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((current) => ({ ...current, email: "" }));
                    }}
                  />
                  {errors.email ? <p className="text-sm text-rose-600">{errors.email}</p> : null}
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-800">
                  <span>Password</span>
                  <Input
                    type="password"
                    aria-invalid={Boolean(errors.password)}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((current) => ({ ...current, password: "" }));
                    }}
                  />
                  {errors.password ? <p className="text-sm text-rose-600">{errors.password}</p> : null}
                </label>

                {status ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{status}</div> : null}

                <Button className="w-full rounded-full" size="lg" disabled={submitting}>
                  {submitting ? "Signing in..." : "Login"}
                </Button>

                <p className="text-xs leading-6 text-slate-500">
                  Session behavior: sliding timeout, refreshed on admin activity, with secure HTTP-only cookies.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
