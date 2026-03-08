import { getProfile } from "@/lib/db";
import { SetupNudge } from "./setup-nudge";

export async function SetupNudgeServer() {
  const profile = await getProfile();
  if (!profile) return null;
  return <SetupNudge hasName={!!profile.name} />;
}
