"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { BOOKING_STATUS_CONFIG } from "@/lib/constants";
import {
  Loader2, LogIn, LogOut, Search, AlertCircle, CheckCircle,
  BedDouble, Clock, Phone, RefreshCw, Download,
} from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface BookingRow {
  id: string;
  reference: string;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  booking_type: string;
  guest: { full_name: string; phone: string; email: string | null } | null;
  booking_rooms: { room: { id: string; number: string; type: string; building: string } }[];
}

interface RoomRow {
  id: string;
  number: string;
  type: string;
  building: string;
  status: string;
  capacity: number;
}

type Tab = "arrivals" | "departures" | "in_house";

export default function CheckInPage() {
  const [tab, setTab] = useState<Tab>("arrivals");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: allBookings } = await supabase
        .from("bookings")
        .select("*, guest:guests(full_name, phone, email), booking_rooms(room:rooms(id, number, type, building))")
        .in("status", ["PENDING", "CONFIRMED", "CHECKED_IN"])
        .order("check_in", { ascending: true });

      setBookings((allBookings || []) as unknown as BookingRow[]);

      const { data: rooms } = await supabase
        .from("rooms")
        .select("id, number, type, building, status, capacity")
        .eq("status", "AVAILABLE")
        .order("number", { ascending: true });

      setAvailableRooms((rooms || []) as RoomRow[]);
    } catch (err) {
      console.error("Failed to load check-in data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const arrivals = bookings.filter((b) =>
    b.check_in === today && ["PENDING", "CONFIRMED"].includes(b.status),
  );
  const departures = bookings.filter((b) =>
    b.check_out === today && b.status === "CHECKED_IN",
  );
  const inHouse = bookings.filter((b) => b.status === "CHECKED_IN");

  const currentList = tab === "arrivals" ? arrivals : tab === "departures" ? departures : inHouse;

  const filtered = currentList.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.reference.toLowerCase().includes(q) ||
      b.guest?.full_name?.toLowerCase().includes(q) ||
      b.guest?.phone?.includes(q)
    );
  });

  const handleCheckin = async () => {
    if (!selectedBooking) return;
    setActionLoading(selectedBooking.id);
    try {
      const res = await fetch("/api/bookings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          action: "checkin",
          room_ids: selectedRooms,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setShowCheckinDialog(false);
      setSelectedBooking(null);
      setSelectedRooms([]);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckout = async () => {
    if (!selectedBooking) return;
    setActionLoading(selectedBooking.id);
    try {
      const res = await fetch("/api/bookings/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          action: "checkout",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setShowCheckoutDialog(false);
      setSelectedBooking(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Check-out failed");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
    );
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Check-in / Check-out" description="Manage guest arrivals and departures" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Check-in / Check-out" description="Manage guest arrivals and departures">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
          downloadCSV("checkin", ["Guest", "Phone", "Reference", "Room(s)", "Check-in", "Check-out", "Nights", "Status", "Total", "Paid", "Balance"], filtered.map((b) => [
            b.guest?.full_name ?? "", b.guest?.phone ?? "", b.reference, (b.booking_rooms ?? []).map((br) => br.room.number).join(", "), b.check_in, b.check_out, b.nights, b.status, Number(b.total_amount), Number(b.paid_amount), Number(b.balance),
          ]));
        }}>
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
          <LogIn className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{arrivals.length}</p>
          <p className="text-xs text-muted-foreground">Expected Arrivals</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
          <LogOut className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{departures.length}</p>
          <p className="text-xs text-muted-foreground">Expected Departures</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
          <BedDouble className="h-5 w-5 text-teal-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{inHouse.length}</p>
          <p className="text-xs text-muted-foreground">In-House Guests</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-1.5">
          {([
            { key: "arrivals" as Tab, label: "Arrivals", count: arrivals.length, icon: LogIn },
            { key: "departures" as Tab, label: "Departures", count: departures.length, icon: LogOut },
            { key: "in_house" as Tab, label: "In-House", count: inHouse.length, icon: BedDouble },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border transition-all",
                tab === t.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-muted">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guest, reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 w-56"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="h-9 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No {tab === "arrivals" ? "arrivals" : tab === "departures" ? "departures" : "in-house guests"} found</p>
          <p className="text-xs mt-1">
            {tab === "arrivals" ? "No bookings expected to check in today." : tab === "departures" ? "No guests expected to check out today." : "No guests currently checked in."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((booking) => {
            const hasBalance = Number(booking.balance) > 0;

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between gap-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{booking.guest?.full_name || "Unknown Guest"}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0">{booking.reference}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />{booking.guest?.phone || "N/A"}
                    </span>
                    <span>{formatDate(booking.check_in)} — {formatDate(booking.check_out)}</span>
                    <span>{booking.nights} night{booking.nights > 1 ? "s" : ""}</span>
                  </div>
                  {booking.booking_rooms && booking.booking_rooms.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5">
                      {booking.booking_rooms.map((br, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          Room {br.room.number}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {hasBalance && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Balance</p>
                      <p className="text-sm font-bold text-amber-500">{formatCurrency(Number(booking.balance))}</p>
                    </div>
                  )}

                  <StatusBadge status={booking.status} config={BOOKING_STATUS_CONFIG} />

                  {tab === "arrivals" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setSelectedRooms(booking.booking_rooms?.map((r) => r.room.id) || []);
                        setShowCheckinDialog(true);
                      }}
                      className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <LogIn className="h-3.5 w-3.5" />Check In
                    </Button>
                  )}

                  {(tab === "departures" || tab === "in_house") && booking.status === "CHECKED_IN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCheckoutDialog(true);
                      }}
                      className="gap-1 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                    >
                      <LogOut className="h-3.5 w-3.5" />Check Out
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Check-in Dialog */}
      <Dialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-blue-500" />Check In Guest
            </DialogTitle>
            <DialogDescription>
              Confirm room assignment and check in {selectedBooking?.guest?.full_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Reference</p>
                  <p className="font-semibold">{selectedBooking.reference}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Guest</p>
                  <p className="font-semibold">{selectedBooking.guest?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Check-in</p>
                  <p>{formatDate(selectedBooking.check_in)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Check-out</p>
                  <p>{formatDate(selectedBooking.check_out)}</p>
                </div>
              </div>

              {Number(selectedBooking.balance) > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-amber-700 dark:text-amber-400">
                    Outstanding balance: <strong>{formatCurrency(Number(selectedBooking.balance))}</strong>
                  </span>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Assign Rooms</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => toggleRoom(room.id)}
                      className={cn(
                        "p-2.5 rounded-lg border text-left text-sm transition-all",
                        selectedRooms.includes(room.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <p className="font-semibold">Room {room.number}</p>
                      <p className="text-xs text-muted-foreground">{room.type.replace("_", " ")} · {room.building}</p>
                    </button>
                  ))}
                </div>
                {availableRooms.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No available rooms. Check room management.</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckinDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCheckin}
              disabled={!!actionLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              {actionLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : <><CheckCircle className="h-4 w-4" />Confirm Check-In</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-amber-500" />Check Out Guest
            </DialogTitle>
            <DialogDescription>
              Confirm check-out for {selectedBooking?.guest?.full_name}.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Reference</p>
                  <p className="font-semibold">{selectedBooking.reference}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Guest</p>
                  <p className="font-semibold">{selectedBooking.guest?.full_name}</p>
                </div>
              </div>

              {selectedBooking.booking_rooms && selectedBooking.booking_rooms.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned Rooms (will be marked for cleaning)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBooking.booking_rooms.map((br, i) => (
                      <Badge key={i} variant="outline">Room {br.room.number} ({br.room.type.replace("_", " ")})</Badge>
                    ))}
                  </div>
                </div>
              )}

              {Number(selectedBooking.balance) > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-red-700 dark:text-red-400">
                    <strong>Unsettled balance: {formatCurrency(Number(selectedBooking.balance))}</strong>
                    <br />
                    <span className="text-xs">Guest will be notified of the outstanding amount.</span>
                  </span>
                </div>
              )}

              {Number(selectedBooking.balance) === 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-emerald-700 dark:text-emerald-400">All payments settled. Ready for check-out.</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCheckout}
              disabled={!!actionLoading}
              variant="destructive"
              className="gap-1.5"
            >
              {actionLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : <><LogOut className="h-4 w-4" />Confirm Check-Out</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
