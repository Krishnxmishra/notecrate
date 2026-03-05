"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// This page is opened by the browser extension when the user clicks "Open workspace".
// It reads access_token + refresh_token from the URL hash, sets the Supabase session,
// then redirects to /dashboard — so the user is automatically logged in.

export default function ExtensionAuth() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          router.replace("/dashboard");
          return;
        }
      }

      // No tokens or failed — go to login
      router.replace("/login");
    }

    handleAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb]">
      <div className="text-[13px] text-neutral-400">Signing you in…</div>
    </div>
  );
}
