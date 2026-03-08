import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { ToolsClient } from "./tools-client";

export default function ToolsPage() {
  return (
    <AppShell>
      <TopNav title="Tools" />
      <ToolsClient />
    </AppShell>
  );
}
