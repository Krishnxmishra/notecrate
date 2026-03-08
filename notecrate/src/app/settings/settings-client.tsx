"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { useFontSize, type FontSize } from "@/hooks/use-font-size";
import { LogOut, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ---- Reusable primitives ----

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("mb-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500", className)}>
      {children}
    </h2>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800", className)}>
      {children}
    </div>
  );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-3.5", className)}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
      {children}
    </label>
  );
}

// ---- Toggle switch ----
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-700"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ---- Pill button group ----
function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-0.5 gap-0.5 bg-neutral-100 dark:bg-neutral-800 w-fit">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
            value === opt.value
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---- Toggle row ----
function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">{label}</p>
        <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </Row>
  );
}

// ---- Main component ----
export function SettingsClient({
  email,
  name,
  stats,
}: {
  email: string | null;
  name: string | null;
  stats: { totalHighlights: number; totalFolders: number; thisWeek: number; estimatedBytes: number };
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useFontSize();

  // Profile
  const [nameValue, setNameValue] = useState(name ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Notifications
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifSync, setNotifSync] = useState(true);
  const [notifProduct, setNotifProduct] = useState(false);

  // Privacy
  const [privacyAnalytics, setPrivacyAnalytics] = useState(true);
  const [privacyAI, setPrivacyAI] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateProfile(nameValue.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const initial = nameValue ? nameValue[0].toUpperCase() : email ? email[0].toUpperCase() : "?";

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#fbfbfb] dark:bg-neutral-950">
      <div className="mx-auto max-w-lg space-y-7">

        {/* PROFILE */}
        <section>
          <SectionLabel>Profile</SectionLabel>
          <form onSubmit={handleSave}>
            <Card>
              <Row>
                <FieldLabel>Full name</FieldLabel>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Your name"
                  suppressHydrationWarning
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-[13px] text-neutral-900 dark:text-neutral-100 outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:focus:border-neutral-500 focus:bg-white dark:focus:bg-neutral-800 transition-colors"
                />
              </Row>
              <Row>
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  value={email ?? ""}
                  disabled
                  suppressHydrationWarning
                  className="w-full rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-[13px] text-neutral-400 dark:text-neutral-600 outline-none cursor-not-allowed"
                />
              </Row>
              <Row className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-medium text-white transition-all duration-200",
                    saved
                      ? "bg-emerald-600 hover:bg-emerald-600"
                      : "bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50"
                  )}
                >
                  {saved && <Check className="h-3 w-3" />}
                  {saved ? "Saved" : isPending ? "Saving…" : "Save"}
                </button>
              </Row>
            </Card>
          </form>
        </section>

        {/* ACCOUNT */}
        <section>
          <SectionLabel>Account</SectionLabel>
          <Card>
            <Row className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-[13px] font-bold text-white dark:text-neutral-900">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {nameValue || "No name set"}
                </p>
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500 truncate">{email ?? "—"}</p>
              </div>
            </Row>
            <div className="mx-4 h-px bg-neutral-100 dark:bg-neutral-800" />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-red-600 dark:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 rounded-b-xl"
            >
              <LogOut className="h-[14px] w-[14px]" />
              Sign out
            </button>
          </Card>
        </section>

        {/* APPEARANCE */}
        <section>
          <SectionLabel>Appearance</SectionLabel>
          <Card>
            <Row className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Theme</p>
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">Choose your color scheme</p>
              </div>
              <PillGroup<Theme>
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ]}
                value={theme}
                onChange={setTheme}
              />
            </Row>
            <Row className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Font size</p>
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">Adjust reading comfort</p>
              </div>
              <PillGroup<FontSize>
                options={[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                ]}
                value={fontSize}
                onChange={setFontSize}
              />
            </Row>
          </Card>
        </section>

        {/* NOTIFICATIONS */}
        <section>
          <SectionLabel>Notifications</SectionLabel>
          <Card>
            <ToggleRow
              label="Weekly digest"
              desc="Summary of your saved highlights"
              checked={notifWeekly}
              onChange={setNotifWeekly}
            />
            <ToggleRow
              label="Sync alerts"
              desc="When a tool connection fails"
              checked={notifSync}
              onChange={setNotifSync}
            />
            <ToggleRow
              label="Product updates"
              desc="New features and announcements"
              checked={notifProduct}
              onChange={setNotifProduct}
            />
          </Card>
        </section>

        {/* STORAGE */}
        <section>
          <SectionLabel>Storage</SectionLabel>
          <Card>
            <Row className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Unlimited storage</p>
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Using ~{formatBytes(stats.estimatedBytes)} of text data
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Unlimited
              </span>
            </Row>
            <Row className="grid grid-cols-3 gap-3 !py-3">
              {[
                { label: "Highlights", value: stats.totalHighlights.toLocaleString() },
                { label: "Folders", value: stats.totalFolders.toLocaleString() },
                { label: "This week", value: stats.thisWeek.toLocaleString() },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg bg-neutral-50 dark:bg-neutral-800 px-3 py-3 text-center"
                >
                  <p className="text-[18px] font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </Row>
          </Card>
        </section>

        {/* PRIVACY */}
        <section>
          <SectionLabel>Privacy</SectionLabel>
          <Card>
            <ToggleRow
              label="Usage analytics"
              desc="Help improve NoteCrate (anonymous)"
              checked={privacyAnalytics}
              onChange={setPrivacyAnalytics}
            />
            <ToggleRow
              label="AI training opt-in"
              desc="Allow highlights to improve AI features"
              checked={privacyAI}
              onChange={setPrivacyAI}
            />
          </Card>
        </section>

        {/* DANGER ZONE */}
        <section>
          <SectionLabel className="text-red-500 dark:text-red-500">Danger zone</SectionLabel>
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-neutral-900">
            <Row className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-neutral-800 dark:text-neutral-200">Delete account</p>
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
              </div>
              <button className="shrink-0 rounded-lg border border-red-300 dark:border-red-800 px-3 py-1.5 text-[12px] font-medium text-red-600 dark:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30">
                Delete
              </button>
            </Row>
          </div>
        </section>

        <div className="h-4" />
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
