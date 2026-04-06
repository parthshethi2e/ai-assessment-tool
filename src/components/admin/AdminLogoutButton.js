"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Button variant="outline" className="rounded-full" onClick={handleLogout}>
      Logout
    </Button>
  );
}
