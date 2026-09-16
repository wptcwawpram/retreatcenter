"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { animateRowToBin } from "@/lib/delete-animation";

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

  // Recycle-bin mode: pass `table` and the row is snapshotted + moved to the bin
  // (restorable any time). Legacy mode: pass `performDelete` for a deferred hard
  // delete with a short undo window (used where delete has side effects, e.g. payments).
  const scheduleDelete = useCallback((opts: {
    id: string;
    label: string;
    performDelete?: () => Promise<void>;
    table?: string;
  }) => {
    const { id, label, performDelete, table } = opts;

    // ── Recycle-bin mode ──────────────────────────────────────────────
    if (table) {
      // Animate the actual row rolling into the bin (captured before it's hidden)
      let animated = false;
      if (typeof document !== "undefined") {
        const rowEl = document.querySelector(`[data-row-id="${id}"]`) as HTMLElement | null;
        const binEl = document.querySelector("[data-recycle-bin]") as HTMLElement | null;
        if (rowEl) {
          animated = true;
          animateRowToBin(rowEl, binEl, () => window.dispatchEvent(new CustomEvent("trash:landed")));
        }
      }
      setPendingIds((prev) => new Set(prev).add(id));
      (async () => {
        try {
          const res = await fetch("/api/trash", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table, id, label }),
          });
          const d = await res.json();
          if (!res.ok) throw new Error(d.error || "Failed");
          refetchRef.current?.();
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("trash:changed", { detail: { added: !animated } }));
          toast(`${label} moved to bin`, {
            duration,
            action: {
              label: "Undo",
              onClick: async () => {
                try {
                  await fetch("/api/trash", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashId: d.trashId }) });
                  refetchRef.current?.();
                  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("trash:changed", {}));
                  toast.success(`${label} restored`);
                } catch { toast.error("Restore failed"); }
              },
            },
          });
        } catch (err) {
          unhide(id);
          toast.error(err instanceof Error ? err.message : "Could not delete");
        }
      })();
      return;
    }

    // ── Legacy deferred mode ──────────────────────────────────────────
    if (!performDelete) return;
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

  // Refetch when something is restored from the recycle bin so the row reappears
  // on the current page without a manual refresh.
  useEffect(() => {
    const onRestored = () => refetchRef.current?.();
    window.addEventListener("trash:restored", onRestored);
    return () => window.removeEventListener("trash:restored", onRestored);
  }, []);

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
