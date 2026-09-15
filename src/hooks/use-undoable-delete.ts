"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type PendingEntry = {
  timer: ReturnType<typeof setTimeout>;
  performDelete: () => Promise<void>;
};

/**
 * Deferred delete with an Undo toast.
 *
 * The row is hidden from the UI immediately but NOT deleted from the database
 * until the undo window expires. This is safe even for rows with cascading
 * foreign keys (e.g. a booking cascades to its payments) because nothing is
 * removed while the user can still undo.
 *
 * Usage:
 *   const { pendingIds, scheduleDelete } = useUndoableDelete(refetch);
 *   // filter the list:  data.filter((r) => !pendingIds.has(r.id))
 *   scheduleDelete({ id, label: `Booking ${ref}`, performDelete: () => deleteBooking(id) });
 */
export function useUndoableDelete(refetch?: () => void, duration = 6000) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const pending = useRef<Map<string, PendingEntry>>(new Map());
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const unhide = useCallback((id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const commit = useCallback(async (id: string, silent = false) => {
    const entry = pending.current.get(id);
    if (!entry) return;
    pending.current.delete(id);
    clearTimeout(entry.timer);
    try {
      await entry.performDelete();
      if (!silent) refetchRef.current?.();
    } catch {
      unhide(id);
      if (!silent) toast.error("Could not delete - it has been restored.");
    }
  }, [unhide]);

  const scheduleDelete = useCallback((opts: {
    id: string;
    label: string;
    performDelete: () => Promise<void>;
  }) => {
    const { id, label, performDelete } = opts;

    // If this id is already pending, clear the old timer first
    const existing = pending.current.get(id);
    if (existing) clearTimeout(existing.timer);

    setPendingIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => { commit(id); }, duration);
    pending.current.set(id, { timer, performDelete });

    toast(`${label} deleted`, {
      duration,
      action: {
        label: "Undo",
        onClick: () => {
          const entry = pending.current.get(id);
          if (entry) clearTimeout(entry.timer);
          pending.current.delete(id);
          unhide(id);
          toast.success(`${label} restored`);
        },
      },
    });
  }, [commit, duration, unhide]);

  // On unmount, flush any still-pending deletes so a confirmed delete isn't lost
  // if the admin navigates away before the window closes.
  useEffect(() => {
    const map = pending.current;
    return () => {
      map.forEach((entry) => {
        clearTimeout(entry.timer);
        entry.performDelete().catch(() => {});
      });
      map.clear();
    };
  }, []);

  return { pendingIds, scheduleDelete };
}
