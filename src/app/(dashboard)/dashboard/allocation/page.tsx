"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { getRooms, getBookingsWithRooms } from "@/lib/supabase/queries";
import { AssignRoomsDialog } from "@/components/dashboard/assign-rooms-dialog";
import { sortRooms, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Loader2, BedDouble, Users, User, DoorOpen, CalendarClock, AlertCircle } from "lucide-react";
import type { Room, Booking, Guest } from "@/lib/supabase/types";

type BookingWithGuest = Booking & { guest?: Guest };

const ROOM_TYPE_SHORT: Record<string, string> = {
  "2_IN_1": "2-in-1", "4_IN_1": "4-in-1", "6_IN_1": "6-in-1",
  SUITE_FAN: "Suite (Fan)", SUITE_AC: "Suite (AC)", APARTMENT: "Apartment",
  "3_IN_1": "3-in-1", KITCHEN: "Kitchen",
};

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  OCCUPIED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CLEANING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DIRTY: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  MAINTENANCE: "bg-red-500/10 text-red-400 border-red-500/20",
  RESERVED: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  BLOCKED: "bg-muted text-muted-foreground border-border/60",
  AWAITING_INSPECTION: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function todayStr() { return new Date().toISOString().split("T")[0]; }

export default function AllocationPage() {
  const { data: rooms, loading: roomsLoading, refetch: refetchRooms } = useSupabaseQuery(getRooms, []);
  const { data: bookings, loading: bookingsLoading, refetch: refetchBookings } = useSupabaseQuery(getBookingsWithRooms, []);
  const [assignItem, setAssignItem] = useState<BookingWithGuest | null>(null);

  const loading = roomsLoading || bookingsLoading;
  const allBookings = (bookings || []) as BookingWithGuest[];
  const allRooms = useMemo(() => sortRooms((rooms || []).filter((r) => r.type !== "KITCHEN")), [rooms]);

  // Active bookings (not cancelled / no-show / checked-out)
  const activeBookings = useMemo(
    () => allBookings.filter((b) => !["CANCELLED", "NO_SHOW", "CHECKED_OUT"].includes(b.status)),
    [allBookings],
  );

  const needingRooms = useMemo(
    () => activeBookings.filter((b) => (b.room_ids?.length || 0) === 0).sort((a, b) => a.check_in.localeCompare(b.check_in)),
    [activeBookings],
  );

  // Which booking currently/next occupies each room
  const roomAssignment = useMemo(() => {
    const today = todayStr();
    const map: Record<string, BookingWithGuest | null> = {};
    for (const room of allRooms) {
      const forRoom = activeBookings
        .filter((b) => (b.room_ids || []).includes(room.id))
        .sort((a, b) => a.check_in.localeCompare(b.check_in));
      const current = forRoom.find((b) => b.check_in <= today && b.check_out > today);
      const upcoming = forRoom.find((b) => b.check_in > today);
      map[room.id] = current || upcoming || null;
    }
    return map;
  }, [allRooms, activeBookings]);

  const roomsByBuilding = useMemo(() => {
    const groups: Record<string, Room[]> = {};
    allRooms.forEach((r) => { (groups[r.building || "Other"] ||= []).push(r); });
    return groups;
  }, [allRooms]);

  const assignedRoomCount = useMemo(
    () => allRooms.filter((r) => roomAssignment[r.id]).length,
    [allRooms, roomAssignment],
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" /></div>;
  }

  const refetch = () => { refetchRooms(); refetchBookings(); };

  return (
    <div className="space-y-5">
      <PageHeader title="Room Allocation" description="Assign bookings to rooms before or at check-in. Physical room status stays untouched until the guest checks in." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Bookings needing rooms" value={needingRooms.length} icon={AlertCircle} iconClassName="bg-amber-500/10 text-amber-500" />
        <StatCard title="Rooms assigned" value={`${assignedRoomCount} / ${allRooms.length}`} icon={BedDouble} iconClassName="bg-sidebar-primary/10 text-sidebar-primary" />
        <StatCard title="Rooms free" value={allRooms.length - assignedRoomCount} icon={DoorOpen} iconClassName="bg-teal-500/10 text-teal-500" />
        <StatCard title="Active bookings" value={activeBookings.length} icon={CalendarClock} iconClassName="bg-blue-500/10 text-blue-500" />
      </div>

      {/* Bookings needing rooms */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" /> Bookings needing rooms
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{needingRooms.length}</span>
        </h2>
        {needingRooms.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Everything is allocated. Nothing waiting for a room.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {needingRooms.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                    {b.booking_type === "INDIVIDUAL" ? <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    {b.guest?.full_name || "Guest"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate font-mono">{b.reference}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 shrink-0 text-sidebar-primary" onClick={() => setAssignItem(b)}>
                  <BedDouble className="h-3.5 w-3.5" />Assign
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rooms overview */}
      <div className="space-y-4">
        {Object.entries(roomsByBuilding).map(([building, brooms]) => (
          <div key={building} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{building}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {brooms.map((room) => {
                const assigned = roomAssignment[room.id];
                return (
                  <div key={room.id} className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold">{room.number}</p>
                        <p className="text-[10px] text-muted-foreground">{ROOM_TYPE_SHORT[room.type] || room.type}</p>
                      </div>
                      <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full border", STATUS_STYLES[room.status] || "bg-muted text-muted-foreground border-border/60")}>
                        {room.status}
                      </span>
                    </div>
                    {assigned ? (
                      <button
                        onClick={() => setAssignItem(assigned)}
                        className="w-full text-left rounded-md bg-sidebar-primary/5 border border-sidebar-primary/20 p-2 hover:bg-sidebar-primary/10 transition-colors"
                      >
                        <p className="text-[11px] font-semibold truncate flex items-center gap-1">
                          {assigned.booking_type === "INDIVIDUAL" ? <User className="h-3 w-3 shrink-0" /> : <Users className="h-3 w-3 shrink-0" />}
                          {assigned.guest?.full_name || "Guest"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(assigned.check_in)} → {formatDate(assigned.check_out)}</p>
                      </button>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic py-1">Free — no booking assigned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {allRooms.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No rooms found. Add rooms in the Rooms page first.</p>
        )}
      </div>

      {assignItem && (
        <AssignRoomsDialog
          booking={assignItem}
          allRooms={rooms || []}
          allBookings={allBookings}
          onClose={() => setAssignItem(null)}
          onSaved={() => { setAssignItem(null); refetch(); }}
        />
      )}
    </div>
  );
}
