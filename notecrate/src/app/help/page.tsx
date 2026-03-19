import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";

export default function HelpPage() {
    return (
        <AppShell>
            <TopNav title="Help" />
            <div className="flex-1 overflow-y-auto bg-[#fbfbfb]">
                <div className="mx-auto max-w-[960px] px-8 py-8">
                    <div className="mb-8">
                        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-neutral-900">
                            Help & Support
                        </h2>
                        <p className="mt-0.5 text-[13px] text-neutral-400">
                            Find answers and get help with NoteCrate.
                        </p>
                    </div>
                    <div className="rounded-lg border border-neutral-200/80 bg-white p-8 text-center text-[13px] text-neutral-500">
                        Support resources coming soon.
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
