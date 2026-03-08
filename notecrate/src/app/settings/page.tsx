import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { getUser } from "@/lib/supabase/auth";
import { getProfile, getStats } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const [user, profile, stats] = await Promise.all([getUser(), getProfile(), getStats()]);
  return (
    <AppShell>
      <TopNav title="Settings" />
      <SettingsClient
        email={user?.email ?? null}
        name={profile?.name ?? null}
        stats={stats}
      />
    </AppShell>
  );
}
