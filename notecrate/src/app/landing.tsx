"use client";

import Link from "next/link";
import {
  FolderClosed,
  Bot,
  Youtube,
  Palette,
  Puzzle,
  BookOpen,
  FlaskConical,
  Home,
  Briefcase,
  Highlighter,
} from "lucide-react";

const FEATURES = [
  {
    icon: Highlighter,
    title: "Highlight anywhere",
    desc: "Save quotes and clips from any webpage or YouTube video with the browser extension.",
  },
  {
    icon: FolderClosed,
    title: "Organize into folders",
    desc: "Group highlights by project, topic, or research thread. Nested folders supported.",
  },
  {
    icon: Bot,
    title: "Export to Claude",
    desc: "Copy, download, or stream your highlights directly into a Claude conversation.",
  },
  {
    icon: Youtube,
    title: "YouTube clips",
    desc: "Capture a quote and timestamp from any video. The extension works inside the player.",
  },
  {
    icon: Palette,
    title: "Color-coded",
    desc: "Tag highlights by color so you can filter and spot patterns at a glance.",
  },
  {
    icon: Puzzle,
    title: "MCP server",
    desc: "Give Claude live access to your folders — no copy-pasting, just ask and it reads.",
  },
];

const CASES = [
  {
    icon: BookOpen,
    title: "Research",
    desc: "Collect sources across papers, articles, and videos. Export the whole folder to Claude for synthesis.",
  },
  {
    icon: FlaskConical,
    title: "Learning",
    desc: "Build a personal knowledge base as you learn. Ask Claude to quiz you or explain concepts.",
  },
  {
    icon: Home,
    title: "Projects",
    desc: "Gather inspiration and references for home, creative, or side projects in one place.",
  },
  {
    icon: Briefcase,
    title: "Work",
    desc: "Save competitive intelligence, meeting notes, and industry reads. Query with Claude instantly.",
  },
];

const PERKS = [
  "Unlimited highlights",
  "Unlimited folders",
  "Browser extension",
  "Claude export (Markdown / JSON / TXT)",
  "MCP server",
  "YouTube timestamps",
];

const FOLDERS = ["Thesis Research", "Market Analysis", "Kitchen Renovation", "AI Ethics Essay", "Guitar Learning"];

const CARDS = [
  { color: "bg-yellow-100 border-yellow-200", text: "Transformers outperform RNNs on most NLP benchmarks", source: "Attention Is All You Need" },
  { color: "bg-blue-100 border-blue-200", text: "Value-based pricing boosts SaaS margins by 24%", source: "SaaS Pricing 2026" },
  { color: "bg-green-100 border-green-200", text: "Shaker cabinets with matte black hardware trending", source: "Kitchen Design Trends" },
  { color: "bg-pink-100 border-pink-200", text: "EU AI Act introduces risk-based classification tiers", source: "Regulating AI: Global Approaches" },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="NoteCrate" width={28} height={28} className="rounded-md" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span className="text-[17px] font-semibold tracking-tight text-neutral-900">NoteCrate</span>
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
      <section className="mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
        <p className="mb-4 inline-block rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          Free beta
        </p>
        <h1 className="mb-5 text-[52px] font-bold leading-[1.1] tracking-[-0.03em] text-neutral-900">
          Organize material.
          <br />
          <span className="text-neutral-400">Get clarity.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-[480px] text-[16px] leading-relaxed text-neutral-500">
          Highlight from any webpage or YouTube video. Organize into folders. Export to Claude for instant analysis — or let Claude read your notes directly.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-neutral-900 px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-neutral-200 px-5 py-2.5 text-[14px] text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* App mockup */}
      <section className="mx-auto mb-20 max-w-5xl px-6">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-200" />
            <div className="mx-3 h-5 flex-1 rounded bg-neutral-100 text-center text-[10px] leading-5 text-neutral-400">
              app.notecrate.io
            </div>
          </div>
          {/* App interior */}
          <div className="flex" style={{ minHeight: 340 }}>
            {/* Sidebar */}
            <div className="w-48 shrink-0 border-r border-neutral-100 bg-neutral-50 px-3 py-4">
              <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-neutral-400">Folders</p>
              {FOLDERS.map((name, i) => (
                <div
                  key={name}
                  className={"mb-0.5 flex items-center gap-2 rounded-md px-2 py-1.5 " + (i === 0 ? "bg-neutral-200" : "")}
                >
                  <FolderClosed className="h-3 w-3 text-neutral-400" />
                  <span className="truncate text-[11px] text-neutral-700">{name}</span>
                </div>
              ))}
            </div>
            {/* Main */}
            <div className="flex-1 p-5">
              <p className="mb-3 text-[12px] font-medium text-neutral-900">Recent highlights</p>
              <div className="grid grid-cols-2 gap-2.5">
                {CARDS.map((card) => (
                  <div
                    key={card.text}
                    className={"rounded-lg border p-3 " + card.color}
                  >
                    <p className="mb-1 text-[11px] leading-relaxed text-neutral-700">{card.text}</p>
                    <p className="text-[10px] text-neutral-400">{card.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mb-20 max-w-5xl px-6">
        <h2 className="mb-2 text-center text-[28px] font-bold tracking-[-0.02em] text-neutral-900">
          Everything in one place
        </h2>
        <p className="mb-10 text-center text-[14px] text-neutral-500">
          From first highlight to Claude-ready export in seconds.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-neutral-100 bg-neutral-50 p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                <f.icon className="h-4 w-4 text-neutral-700" />
              </div>
              <p className="mb-1 text-[13px] font-semibold text-neutral-900">{f.title}</p>
              <p className="text-[12px] leading-relaxed text-neutral-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto mb-20 max-w-5xl px-6">
        <h2 className="mb-2 text-center text-[28px] font-bold tracking-[-0.02em] text-neutral-900">
          Built for every kind of research
        </h2>
        <p className="mb-10 text-center text-[14px] text-neutral-500">
          Whether you study, build, or just like saving good ideas.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {CASES.map((c) => (
            <div key={c.title} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50">
                <c.icon className="h-4 w-4 text-neutral-600" />
              </div>
              <div>
                <p className="mb-1 text-[13px] font-semibold text-neutral-900">{c.title}</p>
                <p className="text-[12px] leading-relaxed text-neutral-500">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto mb-20 max-w-5xl px-6">
        <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-center">
          <p className="mb-1 text-[12px] font-medium uppercase tracking-wider text-neutral-400">Free Beta</p>
          <p className="mb-1 text-[48px] font-bold tracking-tight text-neutral-900">$0</p>
          <p className="mb-6 text-[13px] text-neutral-500">Everything included, no credit card needed.</p>
          <ul className="mb-7 space-y-2 text-left">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-[13px] text-neutral-700">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="block w-full rounded-lg bg-neutral-900 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-neutral-700"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-light.png" alt="NoteCrate" width={22} height={22} className="rounded-sm" style={{ width: 22, height: 22, objectFit: "contain" }} />
          <span className="text-[16px] font-semibold text-neutral-900">NoteCrate</span>
        </div>
        <p className="text-[12px] text-neutral-400">
          &copy; {new Date().getFullYear()} NoteCrate. Free during beta.
        </p>
      </footer>
    </div>
  );
}
