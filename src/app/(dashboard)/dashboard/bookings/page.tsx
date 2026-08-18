"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberStepper } from "@/components/ui/number-stepper";
import { BOOKING_STATUS_CONFIG } from "@/lib/constants";
import { getBookings, updateBooking, deleteBooking, getGuests } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Search, Loader2, Eye, Edit2, Trash2, AlertCircle, CheckCircle,
  BedDouble, Church, Users, User, ChevronDown, Download,
} from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import type { Booking, Guest } from "@/lib/supabase/types";

type BookingWithGuest = Booking & { guest: Guest };

const ROOM_OPTIONS = [
  { label: "2 IN 1", price: 150, type: "2_IN_1" },
  { label: "4 IN 1", price: 200, type: "4_IN_1" },
  { label: "6 IN 1", price: 270, type: "6_IN_1" },
  { label: "Suite (Fan)", price: 350, type: "SUITE_FAN" },
  { label: "Suite (AC)", price: 750, type: "SUITE_AC" },
  { label: "Holy Family Apartment", price: 750, type: "APARTMENT" },
];

const HALL_OPTIONS = [
  { label: "Faith Hall (without AC)", price: 400 },
  { label: "Faith Hall (with AC)", price: 550 },
  { label: "Pavilion (with canopy)", price: 900 },
  { label: "Pavilion (without canopy)", price: 700 },
  { label: "Kitchen & Dining (55+ persons)", price: 500 },
  { label: "Kitchen & Dining (30-50 persons)", price: 400 },
  { label: "Kitchen & Dining (below 20 persons)", price: 250 },
];

const WEDDING_GROUNDS_PRICE = 4000;

// ─── New Booking Dialog (matches website flow) ────────────────────────

function NewBookingDialog({
  open,
  onOpenChange,
  existingGuests,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  existingGuests: Guest[];
  onSuccess: () => void;
}) {
  // Guest mode
  const [guestMode, setGuestMode] = useState<"existing" | "new">("new");
  const [selectedGuestId, setSelectedGuestId] = useState("");

  // Guest info (for new guest)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestIdType, setGuestIdType] = useState("");
  const [guestIdNumber, setGuestIdNumber] = useState("");

  // Booking type
  const [bookingType, setBookingType] = useState<"individual" | "group">("individual");
  const [source, setSource] = useState<"WALK_IN" | "PHONE" | "WEBSITE" | "AGENT">("WALK_IN");

  // Lodging
  const [isLodging, setIsLodging] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
  const [nights, setNights] = useState(1);

  // Hall
  const [needsHall, setNeedsHall] = useState(false);
  const [selectedHall, setSelectedHall] = useState("");
  const [hallDays, setHallDays] = useState(1);
  const [needsGrounds, setNeedsGrounds] = useState(false);

  // Dates
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Breakdowns
  const [showRoomBreakdown, setShowRoomBreakdown] = useState(false);
  const [showHallBreakdown, setShowHallBreakdown] = useState(false);

  // Auto-sync check-out from check-in + nights
  useEffect(() => {
    if (checkIn && nights > 0) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + nights);
      const computed = d.toISOString().split("T")[0];
      if (computed !== checkOut) setCheckOut(computed);
    }
  }, [checkIn, nights]);

  // Auto-calculate nights when check-out is manually changed
  useEffect(() => {
    if (checkIn && checkOut) {
      const diff = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff > 0 && diff !== nights) setNights(diff);
    }
  }, [checkOut]);

  // Fill guest fields when selecting existing guest
  useEffect(() => {
    if (guestMode === "existing" && selectedGuestId) {
      const g = existingGuests.find((x) => x.id === selectedGuestId);
      if (g) {
        setGuestName(g.full_name);
        setGuestEmail(g.email || "");
        setGuestPhone(g.phone);
        setGuestIdType(g.id_type || "");
        setGuestIdNumber(g.id_number || "");
      }
    }
  }, [guestMode, selectedGuestId, existingGuests]);

  // Room price calculation
  const roomBreakdownLines = useMemo(() => {
    const lines: { label: string; calc: string; amount: number }[] = [];
    if (!isLodging) return lines;
    if (bookingType === "individual" && selectedRoom) {
      const room = ROOM_OPTIONS.find((r) => r.label === selectedRoom);
      if (room) {
        lines.push({
          label: room.label,
          calc: `GH₵${room.price} × ${nights} night${nights > 1 ? "s" : ""}`,
          amount: room.price * nights,
        });
      }
    } else if (bookingType === "group") {
      ROOM_OPTIONS.forEach((room) => {
        const qty = roomQuantities[room.label] || 0;
        if (qty > 0) {
          lines.push({
            label: `${room.label} × ${qty} room${qty > 1 ? "s" : ""}`,
            calc: `GH₵${room.price} × ${qty} × ${nights} night${nights > 1 ? "s" : ""}`,
            amount: room.price * qty * nights,
          });
        }
      });
    }
    return lines;
  }, [isLodging, selectedRoom, nights, bookingType, roomQuantities]);

  const roomPrice = roomBreakdownLines.reduce((s, l) => s + l.amount, 0);

  // Hall price calculation
  const hallOption = HALL_OPTIONS.find((h) => h.label === selectedHall);
  const hallBasePrice = needsHall && hallOption ? hallOption.price : 0;
  const hallTotal = hallBasePrice * hallDays;
  const groundsPrice = needsGrounds ? WEDDING_GROUNDS_PRICE : 0;
  const hallPrice = hallTotal + groundsPrice;

  const hallBreakdownLines = useMemo(() => {
    const lines: { label: string; calc: string; amount: number }[] = [];
    if (needsHall && hallOption) {
      lines.push({
        label: hallOption.label,
        calc: `GH₵${hallOption.price} × ${hallDays} day${hallDays > 1 ? "s" : ""}`,
        amount: hallOption.price * hallDays,
      });
    }
    if (needsGrounds) {
      lines.push({ label: "Wedding Grounds", calc: "Fixed rate", amount: WEDDING_GROUNDS_PRICE });
    }
    return lines;
  }, [needsHall, hallOption, hallDays, needsGrounds]);

  const totalAmount = roomPrice + hallPrice;

  // Reset form
  const resetForm = useCallback(() => {
    setGuestMode("new");
    setSelectedGuestId("");
    setGuestName(""); setGuestEmail(""); setGuestPhone(""); setGuestIdType(""); setGuestIdNumber("");
    setBookingType("individual"); setSource("WALK_IN");
    setIsLodging(true); setSelectedRoom(""); setRoomQuantities({}); setNights(1);
    setNeedsHall(false); setSelectedHall(""); setHallDays(1); setNeedsGrounds(false);
    setCheckIn(""); setCheckOut(""); setSpecialRequests("");
    setError(""); setSuccess("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!guestName || !guestPhone) {
      setError("Guest name and phone are required.");
      return;
    }
    if (!checkIn || !checkOut) {
      setError("Check-in and check-out dates are required.");
      return;
    }
    if (totalAmount <= 0) {
      setError("Please select at least one room or hall.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Use the same /api/bookings endpoint as the website
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest: {
            full_name: guestName,
            email: guestEmail || undefined,
            phone: guestPhone,
            id_type: guestIdType || undefined,
            id_number: guestIdNumber || undefined,
          },
          booking: {
            check_in: checkIn,
            check_out: checkOut,
            nights,
            adults: 1,
            children: 0,
            total_amount: totalAmount,
            booking_type: bookingType === "group" ? "GROUP" : "INDIVIDUAL",
            special_requests: specialRequests || undefined,
            hall_days: needsHall ? hallDays : 0,
            hall_amount: hallPrice,
          },
          source, // dashboard adds source
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking");

      setSuccess(`Booking created! Reference: ${data.booking.reference}`);
      onSuccess();

      // Close after a moment
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>Create a booking — same form as the website</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-teal-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-teal-400">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ─── Guest Info ─── */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-sidebar-primary" /> Guest Information
              </h3>
              <div className="flex gap-3 mb-3">
                {(["new", "existing"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGuestMode(mode)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      guestMode === mode
                        ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary"
                        : "border-border text-muted-foreground hover:border-sidebar-primary/40"
                    }`}
                  >
                    {mode === "new" ? "New Guest" : "Existing Guest"}
                  </button>
                ))}
              </div>

              {guestMode === "existing" && (
                <div className="space-y-2">
                  <Label>Select Guest</Label>
                  <select
                    value={selectedGuestId}
                    onChange={(e) => setSelectedGuestId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Choose a guest...</option>
                    {existingGuests.map((g) => (
                      <option key={g.id} value={g.id}>{g.full_name} ({g.phone})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name <span className="text-red-500">*</span></Label>
                  <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone <span className="text-red-500">*</span></Label>
                  <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+233 XXX XXX XXX" type="tel" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email@example.com" type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ID Type</Label>
                  <select
                    value={guestIdType}
                    onChange={(e) => setGuestIdType(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select...</option>
                    <option value="Ghana Card">Ghana Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver&apos;s License</option>
                  </select>
                </div>
                {guestIdType && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">ID Number</Label>
                    <Input value={guestIdNumber} onChange={(e) => setGuestIdNumber(e.target.value)} placeholder="ID number" />
                  </div>
                )}
              </div>
            </div>

            {/* ─── Booking Type & Source ─── */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {(["individual", "group"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBookingType(type)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                        bookingType === type
                          ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary"
                          : "border-border text-muted-foreground hover:border-sidebar-primary/40"
                      }`}
                    >
                      {type === "individual" ? "Individual" : "Group"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Label className="text-xs text-muted-foreground">Source:</Label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as typeof source)}
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="WALK_IN">Walk-In</option>
                    <option value="PHONE">Phone</option>
                    <option value="WEBSITE">Website</option>
                    <option value="AGENT">Agent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ─── Dates ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Check-in <span className="text-red-500">*</span></Label>
                <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Check-out <span className="text-red-500">*</span></Label>
                <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nights</Label>
                <NumberStepper value={nights} onChange={setNights} min={1} max={90} />
              </div>
            </div>

            {/* ─── Lodging / Rooms ─── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <BedDouble className="h-4 w-4 text-sidebar-primary" /> Rooms
                </h3>
                <div className="flex gap-2">
                  {([true, false] as const).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => setIsLodging(opt)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${
                        isLodging === opt
                          ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary"
                          : "border-border text-muted-foreground hover:border-sidebar-primary/40"
                      }`}
                    >
                      {opt ? "Yes" : "No rooms"}
                    </button>
                  ))}
                </div>
              </div>

              {isLodging && (
                <>
                  {bookingType === "individual" ? (
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a room type</option>
                      {ROOM_OPTIONS.map((r) => (
                        <option key={r.label} value={r.label}>
                          {r.label} — GH₵{r.price}/night
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ROOM_OPTIONS.map((r) => (
                        <div key={r.label} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                          <div>
                            <p className="text-xs font-medium">{r.label}</p>
                            <p className="text-[10px] text-muted-foreground">GH₵{r.price}/night</p>
                          </div>
                          <NumberStepper
                            value={roomQuantities[r.label] || 0}
                            onChange={(val) => setRoomQuantities((prev) => ({ ...prev, [r.label]: val }))}
                            min={0}
                            max={20}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ─── Hall / Venue (group only) ─── */}
            {bookingType === "group" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <Church className="h-4 w-4 text-sidebar-primary" /> Hall / Venue
                </h3>
                <div className="flex gap-2">
                  {([true, false] as const).map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => setNeedsHall(opt)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${
                        needsHall === opt
                          ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary"
                          : "border-border text-muted-foreground hover:border-sidebar-primary/40"
                      }`}
                    >
                      {opt ? "Yes" : "No hall"}
                    </button>
                  ))}
                </div>
              </div>

              {needsHall && (
                <div className="space-y-3">
                  <select
                    value={selectedHall}
                    onChange={(e) => setSelectedHall(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a hall</option>
                    {HALL_OPTIONS.map((h) => (
                      <option key={h.label} value={h.label}>
                        {h.label} — GH₵{h.price}/day
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs whitespace-nowrap">Hall days:</Label>
                    <NumberStepper value={hallDays} onChange={setHallDays} min={1} max={30} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dash-wedding"
                  checked={needsGrounds}
                  onChange={(e) => setNeedsGrounds(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-sidebar-primary focus:ring-sidebar-primary"
                />
                <Label htmlFor="dash-wedding" className="text-xs cursor-pointer">
                  Wedding Grounds (GH₵{WEDDING_GROUNDS_PRICE.toLocaleString()})
                </Label>
              </div>
            </div>
            )}

            {/* ─── Special Requests ─── */}
            <div className="space-y-1.5">
              <Label className="text-xs">Special Requests</Label>
              <Textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Any special requests or notes..." rows={2} />
            </div>

            {/* ─── Price Summary ─── */}
            <div className="rounded-lg border border-sidebar-primary/20 bg-sidebar-primary/5 p-4 space-y-1">
              <h4 className="font-semibold text-sm mb-2">Price Summary</h4>

              {/* Room line */}
              <button
                type="button"
                onClick={() => roomBreakdownLines.length > 0 && setShowRoomBreakdown(!showRoomBreakdown)}
                className="flex items-center justify-between w-full py-1.5 text-left"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Rooms
                  {roomBreakdownLines.length > 0 && (
                    <ChevronDown className={`h-3 w-3 text-sidebar-primary transition-transform ${showRoomBreakdown ? "rotate-180" : ""}`} />
                  )}
                </span>
                <span className="text-xs font-semibold">GH₵{roomPrice.toFixed(2)}</span>
              </button>
              {showRoomBreakdown && roomBreakdownLines.map((line, i) => (
                <div key={i} className="flex justify-between text-[10px] text-muted-foreground/70 pl-4">
                  <span>{line.label} <span className="text-muted-foreground">{line.calc}</span></span>
                  <span>= GH₵{line.amount.toFixed(2)}</span>
                </div>
              ))}

              {/* Hall line */}
              <button
                type="button"
                onClick={() => hallBreakdownLines.length > 0 && setShowHallBreakdown(!showHallBreakdown)}
                className="flex items-center justify-between w-full py-1.5 text-left"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Halls / Grounds
                  {hallBreakdownLines.length > 0 && (
                    <ChevronDown className={`h-3 w-3 text-sidebar-primary transition-transform ${showHallBreakdown ? "rotate-180" : ""}`} />
                  )}
                </span>
                <span className="text-xs font-semibold">GH₵{hallPrice.toFixed(2)}</span>
              </button>
              {showHallBreakdown && hallBreakdownLines.map((line, i) => (
                <div key={i} className="flex justify-between text-[10px] text-muted-foreground/70 pl-4">
                  <span>{line.label} <span className="text-muted-foreground">{line.calc}</span></span>
                  <span>= GH₵{line.amount.toFixed(2)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 border-t border-sidebar-primary/30">
                <span className="text-sm font-bold">Total</span>
                <span className="text-base font-bold text-sidebar-primary">GH₵{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* ─── Error / Submit ─── */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false); }} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || totalAmount <= 0}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Creating...</> : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { data: bookings, loading, refetch } = useSupabaseQuery(() => getBookings(), []);
  const { data: guests } = useSupabaseQuery(() => getGuests(), []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<BookingWithGuest | null>(null);
  const [viewItem, setViewItem] = useState<BookingWithGuest | null>(null);
  const [deleteItem, setDeleteItem] = useState<BookingWithGuest | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" /></div>;
  }

  const allBookings = (bookings || []) as BookingWithGuest[];
  const allGuests = guests || [];

  const filtered = allBookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.reference.toLowerCase().includes(q) || b.guest?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const editFields: FormField[] = [
    { name: "status", label: "Status", type: "select", required: true, options: Object.entries(BOOKING_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })) },
    { name: "payment_status", label: "Payment Status", type: "select", options: [{ label: "Unpaid", value: "UNPAID" }, { label: "Partial", value: "PARTIAL" }, { label: "Paid", value: "PAID" }, { label: "Refunded", value: "REFUNDED" }] },
    { name: "check_in", label: "Check-in", type: "date", required: true },
    { name: "check_out", label: "Check-out", type: "date", required: true },
    { name: "nights", label: "Nights", type: "number", min: 1 },
    { name: "total_amount", label: "Total Amount", type: "number", min: 0, step: 0.01 },
    { name: "paid_amount", label: "Paid Amount", type: "number", min: 0, step: 0.01 },
    { name: "special_requests", label: "Special Requests", type: "textarea", colSpan: 2 },
  ];

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    const total = Number(values.total_amount) || 0;
    const paid = Number(values.paid_amount) || 0;
    const bal = Math.max(0, total - paid);
    let payStatus = values.payment_status as Booking["payment_status"];
    if (paid >= total && total > 0) payStatus = "PAID";
    else if (paid > 0) payStatus = "PARTIAL";
    else payStatus = "UNPAID";
    await updateBooking(editItem.id, {
      status: values.status as Booking["status"],
      payment_status: payStatus,
      check_in: values.check_in as string,
      check_out: values.check_out as string,
      nights: Number(values.nights),
      total_amount: total,
      paid_amount: paid,
      balance: bal,
      special_requests: (values.special_requests as string) || null,
    });
    setEditItem(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteItem.id);
      setDeleteItem(null);
      refetch();
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<BookingWithGuest>[] = [
    { header: "Reference", accessor: (b) => <span className="font-mono text-xs font-bold">{b.reference}</span> },
    { header: "Guest", accessor: (b) => (
      <div>
        <p className="font-medium">{b.guest?.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{b.guest?.phone ?? "—"}</p>
      </div>
    )},
    { header: "Check-in", accessor: (b) => <span className="text-sm">{formatDate(b.check_in)}</span> },
    { header: "Check-out", accessor: (b) => <span className="text-sm">{formatDate(b.check_out)}</span> },
    { header: "Total", accessor: (b) => <span className="font-semibold">{formatCurrency(Number(b.total_amount))}</span> },
    { header: "Paid", accessor: (b) => {
      const isPaid = Number(b.paid_amount) >= Number(b.total_amount);
      return <span className={isPaid ? "text-teal-500" : "text-sidebar-primary"}>{formatCurrency(Number(b.paid_amount))}</span>;
    }},
    { header: "Status", accessor: (b) => <StatusBadge status={b.status} config={BOOKING_STATUS_CONFIG} /> },
    { header: "Actions", accessor: (b) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setViewItem(b); }}><Eye className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditItem(b); }}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setDeleteItem(b); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Bookings" description="Manage all guest bookings and reservations" action={{ label: "New Booking", onClick: () => setShowAdd(true) }}>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
          downloadCSV("bookings", ["Reference", "Guest", "Phone", "Check-in", "Check-out", "Nights", "Status", "Total", "Paid", "Balance"], filtered.map((b) => [
            b.reference, b.guest?.full_name ?? "", b.guest?.phone ?? "", b.check_in, b.check_out, b.nights, b.status, Number(b.total_amount), Number(b.paid_amount), Number(b.balance),
          ]));
        }}>
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by reference or guest name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(BOOKING_STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(b) => b.id} total={filtered.length} emptyMessage="No bookings found" />

      {/* New Booking Dialog — full form matching website */}
      <NewBookingDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        existingGuests={allGuests}
        onSuccess={refetch}
      />

      {/* Edit Dialog */}
      {editItem && (
        <FormDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          title={`Edit Booking ${editItem.reference}`}
          fields={editFields}
          initialValues={editItem}
          onSubmit={handleEdit}
          isEdit
        />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Booking {viewItem?.reference}</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Guest:</span><p className="font-medium">{viewItem.guest?.full_name}</p></div>
                <div><span className="text-muted-foreground">Phone:</span><p>{viewItem.guest?.phone}</p></div>
                <div><span className="text-muted-foreground">Check-in:</span><p>{formatDate(viewItem.check_in)}</p></div>
                <div><span className="text-muted-foreground">Check-out:</span><p>{formatDate(viewItem.check_out)}</p></div>
                <div><span className="text-muted-foreground">Nights:</span><p>{viewItem.nights}</p></div>
                <div><span className="text-muted-foreground">Type:</span><p>{viewItem.booking_type}</p></div>
                <div><span className="text-muted-foreground">Total:</span><p className="font-bold">{formatCurrency(Number(viewItem.total_amount))}</p></div>
                <div><span className="text-muted-foreground">Paid:</span><p className="font-bold text-teal-500">{formatCurrency(Number(viewItem.paid_amount))}</p></div>
                <div><span className="text-muted-foreground">Balance:</span><p className="font-bold text-sidebar-primary">{formatCurrency(Number(viewItem.balance))}</p></div>
                <div><span className="text-muted-foreground">Source:</span><p>{viewItem.source}</p></div>
              </div>
              {viewItem.special_requests && (
                <div><span className="text-muted-foreground">Special Requests:</span><p>{viewItem.special_requests}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
            <Button onClick={() => { setEditItem(viewItem); setViewItem(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Booking</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Are you sure you want to delete booking <strong>{deleteItem?.reference}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
