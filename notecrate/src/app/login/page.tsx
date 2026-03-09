"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size={40} variant="light" />
          <span className="text-[16px] font-semibold tracking-tight text-neutral-900">NoteCrate</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-7 shadow-sm">
          <h1 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">Welcome back</h1>
          <p className="mb-6 text-[13px] text-neutral-500">Sign in to your account.</p>

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
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[13px] text-neutral-500">
          No account?{" "}
          <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
