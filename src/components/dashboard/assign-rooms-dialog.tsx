"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { assignBookingRooms } from "@/lib/supabase/queries";
import { sortRooms } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, BedDouble, Check } from "lucide-react";
import type { Room, Booking, Guest } from "@/lib/supabase/types";

type BookingWithGuest = Booking & { guest?: Guest };

const ROOM_TYPE_SHORT: Record<string, string> = {
  "2_IN_1": "2-in-1", "4_IN_1": "4-in-1", "6_IN_1": "6-in-1",
  SUITE_FAN: "Suite (Fan)", SUITE_AC: "Suite (AC)", APARTMENT: "Apartment",
  "3_IN_1": "3-in-1", KITCHEN: "Kitchen",
};

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}

export function AssignRoomsDialog({
  booking,
  allRooms,
  allBookings,
  onClose,
  onSaved,
}: {
  booking: BookingWithGuest;
  allRooms: Room[];
  allBookings: BookingWithGuest[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isGroup = booking.booking_type !== "INDIVIDUAL";
  const [selected, setSelected] = useState<string[]>(booking.room_ids || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Rooms occupied by OTHER bookings that overlap this booking's dates
  const conflictRoomIds = useMemo(() => {
    const set = new Set<string>();
    allBookings.forEach((b) => {
      if (b.id === booking.id) return;
      if (b.status === "CANCELLED" || b.status === "NO_SHOW" || b.status === "CHECKED_OUT") return;
      if (!overlaps(b.check_in, b.check_out, booking.check_in, booking.check_out)) return;
      (b.room_ids || []).forEach((rid) => set.add(rid));
    });
    return set;
  }, [allBookings, booking]);

  const roomsByBuilding = useMemo(() => {
    const usable = sortRooms(allRooms.filter((r) => r.type !== "KITCHEN"));
    const groups: Record<string, Room[]> = {};
    usable.forEach((r) => {
      const key = r.building || "Other";
      (groups[key] ||= []).push(r);
    });
    return groups;
  }, [allRooms]);

  const toggle = (id: string) => {
    setError("");
    if (isGroup) {
      setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    } else {
      setSelected((prev) => prev.includes(id) ? [] : [id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await assignBookingRooms(booking.id, selected);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign rooms");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-sidebar-primary" /> Assign Rooms — {booking.reference}</DialogTitle>
          <DialogDescription>
            {booking.guest?.full_name} &bull; {booking.check_in} → {booking.check_out} &bull; {isGroup ? "Group (pick one or more rooms)" : "Individual (pick one room)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(roomsByBuilding).map(([building, rooms]) => (
            <div key={building} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{building}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {rooms.map((room) => {
                  const isSelected = selected.includes(room.id);
                  const isConflict = conflictRoomIds.has(room.id) && !isSelected;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      disabled={isConflict}
                      onClick={() => toggle(room.id)}
                      className={cn(
                        "relative text-left rounded-lg border-2 p-2.5 transition-all",
                        isSelected ? "border-sidebar-primary bg-sidebar-primary/10"
                          : isConflict ? "border-border/40 bg-muted/30 opacity-50 cursor-not-allowed"
                          : "border-border hover:border-sidebar-primary/40",
                      )}
                      title={isConflict ? "Occupied by another booking on these dates" : ""}
                    >
                      {isSelected && <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-sidebar-primary" />}
                      <p className="text-sm font-bold">{room.number}</p>
                      <p className="text-[10px] text-muted-foreground">{ROOM_TYPE_SHORT[room.type] || room.type}</p>
                      {isConflict && <p className="text-[9px] text-red-400 font-medium mt-0.5">Occupied</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {allRooms.filter((r) => r.type !== "KITCHEN").length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No rooms found. Add rooms in the Rooms page first.</p>
          )}

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
            <span className="text-muted-foreground">{selected.length} room{selected.length === 1 ? "" : "s"} selected</span>
            {selected.length > 0 && (
              <button type="button" onClick={() => setSelected([])} className="text-red-400 hover:underline">Clear</button>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : "Save Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
