"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployerAuditLogRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employer/audit");
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-500">
      Redirecting to Audit Trail...
    </div>
  );
}
