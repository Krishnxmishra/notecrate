"use client";

import { useEffect, useState } from "react";
import { Chrome, X, Pin } from "lucide-react";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/notecrate/oooeihfbclammiikoclfioafldbgacma?hl=en-GB&utm_source=ext_sidebar";

const EXT_BANNER_KEY = "nc_ext_banner_dismissed";
const PIN_BANNER_KEY = "nc_pin_banner_dismissed";

type BannerState = "unknown" | "no-extension" | "pin-nudge" | "none";

export function OnboardingBanner({ isNewUser }: { isNewUser: boolean }) {
  const [banner, setBanner] = useState<BannerState>("unknown");

  useEffect(() => {
    if (!isNewUser) { setBanner("none"); return; }

    const extDismissed = localStorage.getItem(EXT_BANNER_KEY);
    const pinDismissed = localStorage.getItem(PIN_BANNER_KEY);

    const extId = process.env.NEXT_PUBLIC_EXTENSION_ID;

    if (!extId || !(window as any).chrome?.runtime?.sendMessage) {
      // Can't detect extension (non-Chrome or no extension API)
      setBanner(extDismissed ? "none" : "no-extension");
      return;
    }

    // Ping the extension with a short timeout
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setBanner(extDismissed ? "none" : "no-extension");
      }
    }, 400);

    try {
      (window as any).chrome.runtime.sendMessage(
        extId,
        { action: "ping" },
        (response: any) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            if (response?.pong) {
              // Extension is installed
              setBanner(pinDismissed ? "none" : "pin-nudge");
            } else {
              setBanner(extDismissed ? "none" : "no-extension");
            }
          }
        }
      );
    } catch {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        setBanner(extDismissed ? "none" : "no-extension");
      }
    }
  }, [isNewUser]);

  function dismissExt() {
    localStorage.setItem(EXT_BANNER_KEY, "1");
    setBanner("none");
  }

  function dismissPin() {
    localStorage.setItem(PIN_BANNER_KEY, "1");
    setBanner("none");
  }

  if (banner === "unknown" || banner === "none") return null;

  if (banner === "no-extension") {
    return (
      <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Chrome className="h-4 w-4 shrink-0 text-neutral-400" />
          <p className="text-[13px] text-neutral-700">
            Save highlights from any page —{" "}
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
            >
              Add the Chrome extension
            </a>
          </p>
        </div>
        <button
          onClick={dismissExt}
          className="ml-4 shrink-0 text-neutral-400 transition-colors hover:text-neutral-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (banner === "pin-nudge") {
    return (
      <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Pin className="h-4 w-4 shrink-0 text-neutral-400" />
          <p className="text-[13px] text-neutral-700">
            Pin the extension to your toolbar for one-click saving
          </p>
        </div>
        <button
          onClick={dismissPin}
          className="ml-4 shrink-0 text-neutral-400 transition-colors hover:text-neutral-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}
