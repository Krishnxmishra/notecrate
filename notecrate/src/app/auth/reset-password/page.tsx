"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase sends ?code=... when using PKCE flow
    const code = searchParams.get("code");
    if (!code) {
      setError("Invalid or expired reset link.");
      setExchanging(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setError("Invalid or expired reset link.");
      setExchanging(false);
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size={40} variant="light" />
          <span className="text-[16px] font-semibold tracking-tight text-neutral-900">NoteCrate</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-7 shadow-sm">
          {done ? (
            <div className="py-4 text-center">
              <p className="mb-1 text-[15px] font-semibold text-neutral-900">Password updated</p>
              <p className="text-[13px] text-neutral-500">Redirecting you to your dashboard…</p>
            </div>
          ) : exchanging ? (
            <p className="py-4 text-center text-[13px] text-neutral-500">Verifying link…</p>
          ) : error && !password ? (
            <div className="py-4 text-center">
              <p className="mb-1 text-[15px] font-semibold text-neutral-900">Link invalid</p>
              <p className="text-[13px] text-neutral-500">{error}</p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">Set new password</h1>
              <p className="mb-6 text-[13px] text-neutral-500">Choose a new password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="confirm">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-lg bg-neutral-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
