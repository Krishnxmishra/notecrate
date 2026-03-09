"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setDone(true);
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
              <p className="mb-1 text-[15px] font-semibold text-neutral-900">Check your email</p>
              <p className="text-[13px] text-neutral-500">
                We sent a reset link to <strong>{email}</strong>. Click it to set a new password.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">Reset password</h1>
              <p className="mb-6 text-[13px] text-neutral-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                    placeholder="you@example.com"
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
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-[13px] text-neutral-500">
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
