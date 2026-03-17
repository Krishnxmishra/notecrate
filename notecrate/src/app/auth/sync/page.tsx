"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SyncInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext && rawNext !== "/" ? rawNext : "/dashboard";

  useEffect(() => {
    router.replace(next);
  }, [next, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb]">
      <div className="text-[13px] text-neutral-400">Setting up…</div>
    </div>
  );
}

export default function AuthSync() {
  return (
    <Suspense>
      <SyncInner />
    </Suspense>
  );
}
