"use client";

import Link from "next/link";
import { Chrome } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Save anything",
    body: "Text, images, YouTube clips, and documents — grabbed from any page in one click.",
  },
  {
    num: "02",
    title: "Stay organized",
    body: "Everything in one place, sorted into folders, color-coded, and searchable.",
  },
  {
    num: "03",
    title: "Your data, ready to use",
    body: "The things you save become part of every tool you work in — no hunting, no pasting, no starting from scratch.",
  },
];

const PERKS = [
  "Unlimited highlights",
  "Unlimited folders",
  "Browser extension",
  "Export (Markdown / JSON / TXT)",
  "YouTube timestamps",
];

const INTEGRATIONS = ["ChatGPT", "Claude", "Gemini", "+ more coming"];

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/notecrate/oooeihfbclammiikoclfioafldbgacma?hl=en-GB&utm_source=ext_sidebar";

export function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.png"
              alt="NoteCrate"
              width={28}
              height={28}
              className="rounded-md"
              style={{ width: 28, height: 28, objectFit: "contain" }}
            />
            <span className="text-[17px] font-semibold tracking-tight text-neutral-900">
              NoteCrate
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/login"
              className="rounded-md px-3.5 py-1.5 text-[13px] text-neutral-600 transition-colors hover:text-neutral-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-neutral-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
        <p className="mb-6 inline-block rounded-full bg-neutral-900 px-4 py-1.5 text-[12px] font-medium tracking-wide text-white">
          Free Beta
        </p>
        <h1 className="mb-6 text-[56px] font-bold leading-[1.05] tracking-[-0.03em]">
          <span className="text-neutral-900">Everything you save,</span>
          <br />
          <span className="text-neutral-400">finally put to work.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-[520px] text-[16px] leading-relaxed text-neutral-500">
          Text, images, YouTube clips, documents — saved from anywhere on the web
          <br />
          and ready to use in the tools you already work in.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-neutral-700"
          >
            <Chrome size={16} />
            Add to Chrome — Free
          </a>
          <Link
            href="/login"
            className="rounded-lg border border-neutral-200 px-5 py-2.5 text-[14px] text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
          >
            Open Web App
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-neutral-100" />
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="mb-12 text-[28px] font-bold tracking-[-0.02em] text-neutral-900">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="rounded-2xl border border-neutral-100 bg-neutral-50 p-7 text-left"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-[13px] font-semibold tabular-nums text-neutral-400 shadow-sm">
                  {i + 1}
                </span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>
              <p className="mb-1.5 text-[15px] font-semibold text-neutral-900">
                {step.title}
              </p>
              <p className="text-[13px] leading-relaxed text-neutral-500">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-neutral-100" />
      </div>

      {/* Integrations */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="mb-8 text-[28px] font-bold tracking-[-0.02em] text-neutral-900">
          Works where you work
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {INTEGRATIONS.map((name) => (
            <span
              key={name}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-5 py-2 text-[13px] font-medium text-neutral-700"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-neutral-100" />
      </div>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-left">
          <p className="mb-1 text-[12px] font-medium uppercase tracking-wider text-neutral-400">
            Free Beta
          </p>
          <p className="mb-1 text-[48px] font-bold tracking-tight text-neutral-900">
            $0
          </p>
          <p className="mb-6 text-[13px] text-neutral-500">
            Everything included, no credit card needed.
          </p>
          <ul className="mb-7 space-y-2.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-[13px] text-neutral-700">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block w-full rounded-lg bg-neutral-900 py-2.5 text-center text-[14px] font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-light.png"
            alt="NoteCrate"
            width={22}
            height={22}
            className="rounded-sm"
            style={{ width: 22, height: 22, objectFit: "contain" }}
          />
          <span className="text-[16px] font-semibold text-neutral-900">
            NoteCrate
          </span>
        </div>
        <p className="text-[12px] text-neutral-400">
          &copy; {new Date().getFullYear()} NoteCrate. Free during beta.
        </p>
        <p className="mt-2 text-[12px]">
          <Link href="/privacy" className="text-neutral-400 hover:text-neutral-600">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
