import Link from "next/link";
import {
<<<<<<< HEAD
=======
  FileText,
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
  FolderClosed,
  Highlighter,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { NewFolderButton } from "@/components/new-folder-button";
import { RecentHighlights } from "./recent-highlights";
import { getFolders, getRecentHighlights, getStats } from "@/lib/db";
<<<<<<< HEAD
import { OnboardingBanner } from "@/components/onboarding-banner";
import { createClient } from "@/lib/supabase/server";

async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", user.id)
    .single();
  return data;
}

export default async function Dashboard() {
  const [recentHighlights, folders, stats, profile] = await Promise.all([
    getRecentHighlights(6),
    getFolders(),
    getStats(),
    getProfile(),
  ]);

  const isNewUser = profile
    ? Date.now() - new Date(profile.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

=======

export default async function Dashboard() {
  const [recentHighlights, folders, stats] = await Promise.all([
    getRecentHighlights(6),
    getFolders(),
    getStats(),
  ]);

>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
  const rootFolders = folders.filter((f) => f.parentId === null);

  return (
    <AppShell>
      <TopNav title="Dashboard" />
      <div className="flex-1 overflow-y-auto bg-[#fbfbfb] dark:bg-neutral-950">
        <div className="mx-auto max-w-[960px] px-8 py-8">
<<<<<<< HEAD
          <OnboardingBanner isNewUser={isNewUser} />
=======
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
              Good morning
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-400 dark:text-neutral-500">
              You have {stats.thisWeek} new highlight{stats.thisWeek !== 1 ? "s" : ""} this week.
            </p>
          </div>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-3 gap-3">
            {[
              { icon: Highlighter, label: "Highlights", value: stats.totalHighlights },
              { icon: FolderClosed, label: "Folders", value: stats.totalFolders },
              { icon: TrendingUp, label: "This week", value: stats.thisWeek },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
                <div className="mb-2.5 text-neutral-400 dark:text-neutral-500">
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-[20px] font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-neutral-100">
                  {stat.value}
                </p>
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Folders */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Your folders
              </h3>
              <NewFolderButton />
            </div>
            {rootFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-12">
                <FolderClosed className="mb-3 h-6 w-6 text-neutral-300 dark:text-neutral-700" />
                <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">No folders yet</p>
                <p className="mt-1 text-[12px] text-neutral-400 dark:text-neutral-500">
                  Use the browser extension to save highlights and they&apos;ll appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {rootFolders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/folder/${folder.id}`}
                    className="group flex items-center justify-between rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3.5 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
                        <FolderClosed className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                          {folder.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          {folder.highlightCount} highlight{folder.highlightCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-neutral-300 dark:text-neutral-700 transition-colors group-hover:text-neutral-500 dark:group-hover:text-neutral-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent highlights */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
                Recent highlights
              </h3>
              <Link
                href="/search"
                className="text-[12px] text-neutral-400 dark:text-neutral-500 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                View all
              </Link>
            </div>
            <RecentHighlights initialHighlights={recentHighlights} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
