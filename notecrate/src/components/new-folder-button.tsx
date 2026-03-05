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
        className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
      >
        <FolderPlus className="h-3.5 w-3.5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[320px] rounded-xl border border-neutral-200 bg-white p-5 shadow-xl">
            <h3 className="mb-3 text-[14px] font-semibold text-neutral-900">New folder</h3>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="Folder name"
              className="mb-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[13px] text-neutral-900 outline-none focus:border-neutral-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-[12px] font-medium text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={isPending || !name.trim()}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
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
