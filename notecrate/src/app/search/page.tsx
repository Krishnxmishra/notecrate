import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { getAllHighlights } from "@/lib/db";
import { SearchView } from "./search-view";

export default async function SearchPage() {
  const highlights = await getAllHighlights();

  return (
    <AppShell>
      <TopNav title="Search" />
      <div className="flex-1 overflow-y-auto bg-[#fbfbfb] dark:bg-neutral-950">
        <div className="mx-auto max-w-[680px] px-6 py-8">
          <SearchView highlights={highlights} />
        </div>
      </div>
    </AppShell>
  );
}
