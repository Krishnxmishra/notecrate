"use client";

import { useState, useRef, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import { createFolder } from "@/lib/actions";

interface Props {
  parentId?: string | null;
  label?: string;
}

export function NewFolderButton({ parentId = null, label = "New folder" }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function openDialog() {
    setName("");
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createFolder(trimmed, parentId);
      setOpen(false);
      setName("");
    });
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="flex items-center gap-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      >
        <FolderPlus className="h-3.5 w-3.5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[320px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 shadow-xl">
            <h3 className="mb-3 text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">New folder</h3>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Folder name"
              className="mb-4 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-[13px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isPending || !name.trim()}
                className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-[12px] font-medium text-white dark:text-neutral-900 transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50"
              >
                {isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
