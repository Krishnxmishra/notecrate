"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        const EXTENSION_ID = "clhlhoknilpidindnflhhjedhfmhnfkd";
        if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage(EXTENSION_ID, { action: "clear-session" }, () => { });
        }
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            title="Sign out"
        >
            <LogOut className="h-[14px] w-[14px]" />
            Sign out
        </button>
    );
}
