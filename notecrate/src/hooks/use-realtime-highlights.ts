"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Highlight, HighlightColor } from "@/lib/data";

function mapRow(raw: Record<string, unknown>): Highlight {
    return {
        id: raw.id as string,
        text: raw.text as string,
        sourceTitle: raw.source_title as string,
        sourceUrl: raw.source_url as string,
        color: raw.color as HighlightColor,
        folderId: raw.folder_id as string,
        createdAt: raw.created_at as string,
        type: raw.type as "text" | "image" | "video",
        imageUrl: (raw.image_url as string) ?? undefined,
        videoId: (raw.video_id as string) ?? undefined,
        videoTimestamp: (raw.video_timestamp as string) ?? undefined,
    };
}

export function useRealtimeHighlights(initialHighlights: Highlight[]) {
    const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);

    // IDs we added/removed via WS — lets us safely merge with server snapshots
    const wsAddedIds = useRef<Set<string>>(new Set());
    const wsRemovedIds = useRef<Set<string>>(new Set());

    // When the server sends a fresh snapshot, merge with any WS-pending items
    useEffect(() => {
        setHighlights((prev) => {
            const serverIds = new Set(initialHighlights.map((h) => h.id));
            const wsOnly = prev.filter(
                (h) => wsAddedIds.current.has(h.id) && !serverIds.has(h.id)
            );
            const merged = [...wsOnly, ...initialHighlights].filter(
                (h) => !wsRemovedIds.current.has(h.id)
            );
            merged.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return merged;
        });
    }, [initialHighlights]);

    const channelRef = useRef<ReturnType<
        ReturnType<typeof createClient>["channel"]
    > | null>(null);

    // Polling fallback: fetch fresh data from Supabase every 8s
    const poll = useCallback(async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from("highlights")
                .select("*")
                .order("created_at", { ascending: false });
            if (!data) return;
            setHighlights((prev) => {
                // Only update if something actually changed
                const incoming = data.map(mapRow).filter(
                    (h) => !wsRemovedIds.current.has(h.id)
                );
                const prevIds = new Set(prev.map((h) => h.id));
                const incomingIds = new Set(incoming.map((h) => h.id));
                const changed =
                    incoming.some((h) => !prevIds.has(h.id)) ||
                    prev.some((h) => !incomingIds.has(h.id));
                if (!changed) return prev;
                // Track any new arrivals from poll as ws-added so server snapshot merge keeps them
                incoming.forEach((h) => {
                    if (!prevIds.has(h.id)) wsAddedIds.current.add(h.id);
                });
                return incoming;
            });
        } catch (_) { /* non-critical */ }
    }, []);

    useEffect(() => {
        const supabase = createClient();

        const ch = supabase
            .channel("public:highlights")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "highlights" },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const raw = payload.new as Record<string, unknown>;
                        const newHighlight = mapRow(raw);
                        wsAddedIds.current.add(raw.id as string);
                        setHighlights((prev) => {
                            if (prev.some((h) => h.id === newHighlight.id)) return prev;
                            const next = [newHighlight, ...prev];
                            next.sort(
                                (a, b) =>
                                    new Date(b.createdAt).getTime() -
                                    new Date(a.createdAt).getTime()
                            );
                            return next;
                        });
                    }
                    if (payload.eventType === "UPDATE") {
                        const raw = payload.new as Record<string, unknown>;
                        setHighlights((prev) =>
                            prev.map((h) =>
                                h.id === raw.id
                                    ? {
                                        ...h,
                                        color: raw.color as HighlightColor,
                                        folderId: raw.folder_id as string,
                                        text: raw.text as string,
                                    }
                                    : h
                            )
                        );
                    }
                    if (payload.eventType === "DELETE") {
                        const id = (payload.old as Record<string, unknown>).id as string;
                        wsRemovedIds.current.add(id);
                        setHighlights((prev) => prev.filter((h) => h.id !== id));
                    }
                }
            )
            .on("broadcast", { event: "custom-delete" }, (payload) => {
                const id = payload.payload?.id as string;
                if (!id) return;
                wsRemovedIds.current.add(id);
                setHighlights((prev) => prev.filter((h) => h.id !== id));
            })
            .on("broadcast", { event: "custom-insert" }, (payload) => {
                const h = payload.payload;
                if (!h?.id) return;
                wsAddedIds.current.add(h.id);
                setHighlights((prev) => {
                    if (prev.some((x) => x.id === h.id)) return prev;
                    return [h, ...prev];
                });
            })
            .subscribe();

        channelRef.current = ch;

        // Poll every 3 seconds as a reliable fallback alongside Realtime
        const interval = setInterval(poll, 3000);

        return () => {
            supabase.removeChannel(ch);
            clearInterval(interval);
        };
    }, [poll]);

    return highlights;
}
