"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2, RotateCcw, X, Loader2, AlertCircle } from "lucide-react";

type TrashItem = {
  id: string;
  entity_type: string;
  entity_id: string;
  label: string | null;
  deleted_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  bookings: "Booking", guests: "Guest", rooms: "Room", inventory_items: "Item",
  housekeeping_tasks: "Task", complaints: "Complaint", events: "Event", finance_categories: "Category",
};

export function RecycleBin() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [emptying, setEmptying] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [lidOpen, setLidOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const confirmEmptyRef = useRef(false);
  const binRef = useRef<HTMLButtonElement>(null);
  const lastPointer = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  // Track the last click point so we can fly the deleted item from there
  useEffect(() => {
    const onDown = (e: PointerEvent) => { lastPointer.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("pointerdown", onDown, true);
    return () => window.removeEventListener("pointerdown", onDown, true);
  }, []);

  const flyToBin = useCallback(() => {
    const bin = binRef.current;
    if (!bin) { setBounce(true); setTimeout(() => setBounce(false), 600); return; }
    const rect = bin.getBoundingClientRect();
    const tx = rect.left + rect.width / 2;
    const ty = rect.top + rect.height / 2;
    const sx = lastPointer.current.x || window.innerWidth / 2;
    const sy = lastPointer.current.y || window.innerHeight / 2;

    const chip = document.createElement("div");
    chip.style.cssText = [
      "position:fixed", `left:${sx}px`, `top:${sy}px`, "z-index:60",
      "width:38px", "height:38px", "margin:-19px 0 0 -19px", "border-radius:9999px",
      "display:flex", "align-items:center", "justify-content:center",
      "background:#c8a44e", "color:#1a1a1a", "box-shadow:0 8px 24px rgba(0,0,0,.3)",
      "pointer-events:none",
    ].join(";");
    chip.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;
    document.body.appendChild(chip);

    const dx = tx - sx;
    const dy = ty - sy;
    setLidOpen(true);
    const anim = chip.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(0.95) rotate(180deg)`, opacity: 0.95, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(360deg)`, opacity: 0.2 },
      ],
      { duration: 700, easing: "cubic-bezier(0.5, -0.2, 0.35, 1.2)" },
    );
    anim.onfinish = () => {
      chip.remove();
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
      setTimeout(() => setLidOpen(false), 350);
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trash");
      if (res.ok) { const d = await res.json(); setItems(d.items || []); }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // React to deletes/restores happening anywhere in the app
  useEffect(() => {
    const onChange = (e: Event) => {
      load();
      if ((e as CustomEvent).detail?.added) flyToBin();
    };
    window.addEventListener("trash:changed", onChange);
    return () => window.removeEventListener("trash:changed", onChange);
  }, [load, flyToBin]);

  const restore = async (item: TrashItem) => {
    setBusyId(item.id);
    try {
      const res = await fetch("/api/trash", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashId: item.id }) });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${item.label || "Item"} restored`);
      window.dispatchEvent(new CustomEvent("trash:changed", {}));
    } catch { toast.error("Restore failed"); }
    finally { setBusyId(null); }
  };

  const removeOne = async (item: TrashItem) => {
    setBusyId(item.id);
    try {
      await fetch("/api/trash", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashId: item.id }) });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {} finally { setBusyId(null); }
  };

  const emptyAll = async () => {
    if (!confirmEmptyRef.current) { confirmEmptyRef.current = true; setTimeout(() => { confirmEmptyRef.current = false; }, 4000); toast("Tap Empty Bin again to permanently delete everything"); return; }
    setEmptying(true);
    try {
      await fetch("/api/trash", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
      setItems([]);
      toast.success("Bin emptied");
    } catch { toast.error("Could not empty bin"); }
    finally { setEmptying(false); confirmEmptyRef.current = false; }
  };

  if (!mounted) return null;
  const count = items.length;

  return createPortal(
    <>
      {/* Floating bin button */}
      <button
        ref={binRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Recycle bin"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all duration-300",
          "bg-card border-border/70 hover:border-sidebar-primary/50 hover:shadow-xl",
          bounce && "animate-bounce",
          (lidOpen || count > 0) ? "text-sidebar-primary" : "text-muted-foreground",
          lidOpen && "scale-110 ring-2 ring-sidebar-primary/40",
        )}
      >
        <Trash2 className={cn("h-5 w-5 transition-transform duration-200", bounce && "scale-125", lidOpen && "-translate-y-0.5")} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sidebar-primary px-1 text-[10px] font-bold text-sidebar-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[70vh] rounded-2xl border border-border/70 bg-popover shadow-2xl flex flex-col animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex items-center justify-between p-4 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-sidebar-primary" />
              <h3 className="text-sm font-semibold">Recycle Bin</h3>
              <span className="text-[11px] text-muted-foreground">({count})</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
            {!loading && count === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Bin is empty
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-card p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.label || TYPE_LABEL[item.entity_type] || "Item"}</p>
                  <p className="text-[10px] text-muted-foreground">{TYPE_LABEL[item.entity_type] || item.entity_type} · {formatDate(item.deleted_at)} {formatTime(item.deleted_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon-sm" title="Restore" className="text-teal-500" disabled={busyId === item.id} onClick={() => restore(item)}>
                    {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Delete permanently" className="text-red-500" disabled={busyId === item.id} onClick={() => removeOne(item)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {count > 0 && (
            <div className="p-3 border-t border-border/60">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10" disabled={emptying} onClick={emptyAll}>
                {emptying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertCircle className="h-3.5 w-3.5" />}
                Empty Bin
              </Button>
            </div>
          )}
        </div>
      )}
    </>,
    document.body,
  );
}
