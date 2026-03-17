"use client";

import { useState } from "react";
import Link from "next/link";
<<<<<<< HEAD
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

const ROLES = [
  "Student",
  "Researcher",
  "Product Manager",
  "Engineer",
  "Designer",
  "Writer",
  "Founder",
  "Other",
];

const USE_CASES = [
  "Research & learning",
  "Note-taking",
  "Content creation",
  "Competitive research",
  "Saving recipes / inspiration",
  "Project planning",
  "Reading later",
  "Other",
];

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/notecrate/oooeihfbclammiikoclfioafldbgacma?hl=en-GB&utm_source=ext_sidebar";

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < current
              ? "w-4 bg-neutral-900"
              : i === current
              ? "w-4 bg-neutral-900"
              : "w-1.5 bg-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = Number(searchParams.get("step") ?? "0");

  const [step, setStep] = useState(initialStep);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 2 state
  const [name, setName] = useState("");
=======
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const router = useRouter();
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
<<<<<<< HEAD
  const [emailSent, setEmailSent] = useState(false);

  // Step 3 state
  const [role, setRole] = useState("");

  // Step 4 state
  const [useCases, setUseCases] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
=======
  const [done, setDone] = useState(false);
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
<<<<<<< HEAD
        redirectTo: `${window.location.origin}/auth/callback?onboard=1`,
=======
        redirectTo: `${window.location.origin}/auth/callback`,
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
      },
    });
    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  }

<<<<<<< HEAD
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      // No email confirmation required — go through /auth/sync to push session
      // to the extension properly (awaits the sendMessage callback), then continue to step 2
      setLoading(false);
      router.push("/auth/sync?next=" + encodeURIComponent("/signup?step=2"));
    } else {
      // Email confirmation required
      setEmailSent(true);
      setLoading(false);
    }
  }

  async function handleFinishProfile() {
    setSavingProfile(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const uid = userId ?? user?.id;
    if (uid) {
      await supabase
        .from("profiles")
        .update({ role, use_case: useCases })
        .eq("id", uid);
    }
    router.push("/dashboard");
  }

  function toggleUseCase(uc: string) {
    setUseCases((prev) =>
      prev.includes(uc) ? prev.filter((x) => x !== uc) : [...prev, uc]
    );
  }

  const pillBase =
    "cursor-pointer rounded-full border px-4 py-2 text-[13px] transition-colors select-none";
  const pillOff = `${pillBase} border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300`;
  const pillOn = `${pillBase} border-neutral-900 bg-neutral-900 text-white`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfb] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <Logo size={40} variant="light" />
          <span className="text-[16px] font-semibold tracking-tight text-neutral-900">
            NoteCrate
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-7 shadow-sm">
          <StepDots current={step} total={4} />

          {/* Step -1 — Email confirmed */}
          {step === -1 && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4.5 4.5L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="mb-1 text-[16px] font-semibold text-neutral-900">Email confirmed!</p>
              <p className="mb-6 text-[13px] text-neutral-500">Your account is ready. Let&apos;s finish setting it up.</p>
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-lg bg-neutral-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                Welcome
              </p>
              <h1 className="mb-3 text-[22px] font-bold leading-tight tracking-[-0.02em] text-neutral-900">
                Everything you save,
                <br />
                <span className="text-neutral-400">finally put to work.</span>
              </h1>
              <p className="mb-7 text-[13px] leading-relaxed text-neutral-500">
                Text, images, YouTube clips, documents — saved from anywhere on
                the web and ready to use in the tools you already work in.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-lg bg-neutral-900 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-neutral-700"
              >
                Get started →
              </button>
              <p className="mt-4 text-[12px] text-neutral-400">
                Free during beta · No credit card needed
              </p>
            </div>
          )}

          {/* Step 1 — Account creation */}
          {step === 1 && (
            <>
              {emailSent ? (
                <div className="py-2 text-center">
                  <p className="mb-1 text-[15px] font-semibold text-neutral-900">
                    Check your email
                  </p>
                  <p className="text-[13px] text-neutral-500">
                    We sent a confirmation link to{" "}
                    <strong>{email}</strong>. Click it to activate your
                    account.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">
                    Create your account
                  </h2>
                  <p className="mb-5 text-[13px] text-neutral-500">
                    Free during beta. No credit card needed.
                  </p>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white py-2.5 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88z" fill="#4285F4"/>
                      <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 0 1-2.72.75 4.79 4.79 0 0 1-4.51-3.32H.83v2.07A8 8 0 0 0 8 16z" fill="#34A853"/>
                      <path d="M3.49 9.49A4.83 4.83 0 0 1 3.24 8c0-.52.09-1.02.25-1.49V4.44H.83A8 8 0 0 0 0 8c0 1.29.31 2.51.83 3.56l2.66-2.07z" fill="#FBBC05"/>
                      <path d="M8 3.2a4.33 4.33 0 0 1 3.07 1.2l2.3-2.3A7.7 7.7 0 0 0 8 0 8 8 0 0 0 .83 4.44L3.49 6.51A4.79 4.79 0 0 1 8 3.2z" fill="#EA4335"/>
                    </svg>
                    {googleLoading ? "Redirecting…" : "Continue with Google"}
                  </button>

                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-neutral-200" />
                    <span className="text-[11px] text-neutral-400">or</span>
                    <div className="h-px flex-1 bg-neutral-200" />
                  </div>

                  <form onSubmit={handleEmailSignup} className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="name">
                        Name
                      </label>
                      <input
                        id="name" type="text" autoComplete="name" required
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email" type="email" autoComplete="email" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="password">
                        Password
                      </label>
                      <input
                        id="password" type="password" autoComplete="new-password" required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                        placeholder="Min. 6 characters"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-neutral-700" htmlFor="confirm">
                        Confirm password
                      </label>
                      <input
                        id="confirm" type="password" autoComplete="new-password" required
                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-100"
                        placeholder="••••••••"
                      />
                    </div>
                    {error && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p>
                    )}
                    <button
                      type="submit" disabled={loading}
                      className="mt-1 w-full rounded-lg bg-neutral-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-60"
                    >
                      {loading ? "Creating account…" : "Create account"}
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          {/* Step 2 — Role */}
          {step === 2 && (
            <>
              <h2 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">
                What&apos;s your role?
              </h2>
              <p className="mb-5 text-[13px] text-neutral-500">
                Helps us build the right things for you.
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={role === r ? pillOn : pillOff}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-neutral-200 px-4 py-2.5 text-[13px] text-neutral-600 transition-colors hover:border-neutral-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!role}
                  className="flex-1 rounded-lg bg-neutral-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* Step 3 — Use cases */}
          {step === 3 && (
            <>
              <h2 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">
                What will you use it for?
              </h2>
              <p className="mb-5 text-[13px] text-neutral-500">
                Select all that apply.
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {USE_CASES.map((uc) => (
                  <button
                    key={uc}
                    type="button"
                    onClick={() => toggleUseCase(uc)}
                    className={useCases.includes(uc) ? pillOn : pillOff}
                  >
                    {uc}
                  </button>
                ))}
              </div>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-neutral-200 px-4 py-2.5 text-[13px] text-neutral-600 transition-colors hover:border-neutral-300"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishProfile}
                  disabled={useCases.length === 0 || savingProfile}
                  className="flex-1 rounded-lg bg-neutral-900 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-40"
                >
                  {savingProfile ? "Setting up…" : "Finish setup →"}
                </button>
              </div>
              {/* Extension nudge */}
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 text-center">
                <p className="mb-1.5 text-[12px] text-neutral-500">
                  Get the most out of NoteCrate
                </p>
                <a
                  href={CHROME_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
                >
                  Add the Chrome extension →
                </a>
              </div>
=======
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
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setDone(true);
      // If email confirmation is disabled in Supabase, redirect immediately
      setTimeout(() => router.push("/dashboard"), 1500);
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
          {done ? (
            <div className="py-4 text-center">
              <p className="mb-1 text-[15px] font-semibold text-neutral-900">Check your email</p>
              <p className="text-[13px] text-neutral-500">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-[18px] font-semibold tracking-tight text-neutral-900">Create account</h1>
              <p className="mb-6 text-[13px] text-neutral-500">Free during beta. No credit card needed.</p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200 bg-white py-2.5 text-[13px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88z" fill="#4285F4"/>
                  <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 0 1-2.72.75 4.79 4.79 0 0 1-4.51-3.32H.83v2.07A8 8 0 0 0 8 16z" fill="#34A853"/>
                  <path d="M3.49 9.49A4.83 4.83 0 0 1 3.24 8c0-.52.09-1.02.25-1.49V4.44H.83A8 8 0 0 0 0 8c0 1.29.31 2.51.83 3.56l2.66-2.07z" fill="#FBBC05"/>
                  <path d="M8 3.2a4.33 4.33 0 0 1 3.07 1.2l2.3-2.3A7.7 7.7 0 0 0 8 0 8 8 0 0 0 .83 4.44L3.49 6.51A4.79 4.79 0 0 1 8 3.2z" fill="#EA4335"/>
                </svg>
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-200" />
                <span className="text-[11px] text-neutral-400">or</span>
                <div className="h-px flex-1 bg-neutral-200" />
              </div>

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
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
            </>
          )}
        </div>

<<<<<<< HEAD
        {step >= 0 && step <= 1 && (
          <p className="mt-4 text-center text-[13px] text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
              Sign in
            </Link>
          </p>
        )}
=======
        <p className="mt-4 text-center text-[13px] text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Sign in
          </Link>
        </p>
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
        <p className="mt-3 text-center text-[12px] text-neutral-400">
          <Link href="/privacy" className="hover:text-neutral-600">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
<<<<<<< HEAD

export default function Signup() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
=======
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
