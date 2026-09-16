"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { NumberStepper } from "@/components/ui/number-stepper";
import { BOOKING_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getBookings, updateBookingFull, deleteBooking, getGuests, getFinanceAccounts, getRooms } from "@/lib/supabase/queries";
import { AssignRoomsDialog } from "@/components/dashboard/assign-rooms-dialog";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { useUndoableDelete } from "@/hooks/use-undoable-delete";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Search, Loader2, Eye, Edit2, Trash2, AlertCircle, CheckCircle,
  BedDouble, Church, Users, User, ChevronDown, Download, Plus, X, CreditCard, Tag,
} from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import type { Booking, Guest, FinanceAccount, BookingSelection } from "@/lib/supabase/types";

type BookingWithGuest = Booking & { guest: Guest };

const ROOM_OPTIONS = [
  { label: "2 IN 1", price: 150, type: "2_IN_1" },
  { label: "4 IN 1", price: 200, type: "4_IN_1" },
  { label: "6 IN 1", price: 270, type: "6_IN_1" },
  { label: "Suite (Fan)", price: 350, type: "SUITE_FAN" },
  { label: "Suite (AC)", price: 750, type: "SUITE_AC" },
  { label: "Holy Family Apartment", price: 750, type: "APARTMENT" },
];

const DEFAULT_HALL_OPTIONS = [
  { label: "Faith Hall (without AC)", price: 400 },
  { label: "Faith Hall (with AC)", price: 550 },
  { label: "Pavilion (with canopy)", price: 900 },
  { label: "Pavilion (without canopy)", price: 700 },
  { label: "Kitchen & Dining (55+ persons)", price: 500 },
  { label: "Kitchen & Dining (30-50 persons)", price: 400 },
  { label: "Kitchen & Dining (below 20 persons)", price: 250 },
];

const DEFAULT_WEDDING_GROUNDS_PRICE = 4000;

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

  // Hall — fetch live pricing
  const [HALL_OPTIONS, setHallOptions] = useState(DEFAULT_HALL_OPTIONS);
  const [WEDDING_GROUNDS_PRICE, setWeddingGroundsPrice] = useState(DEFAULT_WEDDING_GROUNDS_PRICE);

  useEffect(() => {
    fetch("/api/settings/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.halls?.length > 0 || data.kitchen?.length > 0) {
          setHallOptions([...(data.halls || []), ...(data.kitchen || [])]);
        }
        if (typeof data.wedding_grounds === "number") setWeddingGroundsPrice(data.wedding_grounds);
      })
      .catch(() => {});
  }, []);

  const [needsHall, setNeedsHall] = useState(false);
  const [selectedHall, setSelectedHall] = useState("");
  const [hallDays, setHallDays] = useState(1);
  const [needsGrounds, setNeedsGrounds] = useState(false);

  // Dates
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Discount
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount");
  const [discountValue, setDiscountValue] = useState<string>("");

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
  const discountAmt = useMemo(() => {
    const v = parseFloat(discountValue) || 0;
    if (v <= 0) return 0;
    if (discountType === "percent") return Math.min(totalAmount, (totalAmount * v) / 100);
    return Math.min(totalAmount, v);
  }, [discountValue, discountType, totalAmount]);
  const finalAmount = totalAmount - discountAmt;

  // Reset form
  const resetForm = useCallback(() => {
    setGuestMode("new");
    setSelectedGuestId("");
    setGuestName(""); setGuestEmail(""); setGuestPhone(""); setGuestIdType(""); setGuestIdNumber("");
    setBookingType("individual"); setSource("WALK_IN");
    setIsLodging(true); setSelectedRoom(""); setRoomQuantities({}); setNights(1);
    setNeedsHall(false); setSelectedHall(""); setHallDays(1); setNeedsGrounds(false);
    setCheckIn(""); setCheckOut(""); setSpecialRequests("");
    setDiscountType("amount"); setDiscountValue("");
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
    if (finalAmount <= 0 && totalAmount > 0) {
      setError("Discount cannot exceed the total amount.");
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
            total_amount: finalAmount,
            booking_type: bookingType === "group" ? "GROUP" : "INDIVIDUAL",
            special_requests: specialRequests || undefined,
            hall_days: needsHall ? hallDays : 0,
            hall_amount: hallPrice,
            room_amount: roomPrice,
            subtotal: totalAmount,
            discount_type: discountAmt > 0 ? discountType : null,
            discount_value: discountAmt > 0 ? parseFloat(discountValue) || 0 : 0,
            discount_amount: discountAmt,
            selection: {
              bookingType,
              isLodging,
              selectedRoom: bookingType === "individual" ? selectedRoom : undefined,
              roomQuantities: bookingType === "group" ? roomQuantities : undefined,
              needsHall,
              selectedHall,
              hallDays,
              needsGrounds,
            },
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
                <span className="text-sm font-bold">Subtotal</span>
                <span className="text-sm font-bold text-sidebar-primary">GH₵{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* ─── Discount ─── */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Discount (optional)</h3>
              <div className="flex gap-2 items-end">
                <div className="flex rounded-lg border border-border/60 overflow-hidden text-xs">
                  <button type="button" onClick={() => setDiscountType("amount")}
                    className={`px-3 py-1.5 font-medium transition-colors ${discountType === "amount" ? "bg-sidebar-primary/10 text-sidebar-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
                    GH₵
                  </button>
                  <button type="button" onClick={() => setDiscountType("percent")}
                    className={`px-3 py-1.5 font-medium transition-colors ${discountType === "percent" ? "bg-sidebar-primary/10 text-sidebar-primary" : "text-muted-foreground hover:bg-muted/50"}`}>
                    %
                  </button>
                </div>
                <Input
                  type="number" min="0" step="0.01"
                  placeholder={discountType === "amount" ? "Enter amount" : "Enter %"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="h-9 flex-1"
                />
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Discount: {discountType === "percent" ? `${discountValue}% of GH₵${totalAmount.toFixed(2)}` : "Amount"}
                  </span>
                  <span className="text-red-400 font-semibold">-GH₵{discountAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-sidebar-primary/30">
                <span className="text-sm font-bold">Final Total</span>
                <span className="text-base font-bold text-teal-500">GH₵{finalAmount.toFixed(2)}</span>
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
              <Button type="submit" disabled={submitting || finalAmount <= 0}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Creating...</> : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Booking Dialog ──────────────────────────────────────────────

function EditBookingDialog({
  booking,
  onOpenChange,
  onSuccess,
}: {
  booking: BookingWithGuest;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
}) {
  const sel = booking.selection || null;
  const hasSelection = !!sel;

  const [status, setStatus] = useState<Booking["status"]>(booking.status);
  const [source, setSource] = useState(booking.source);
  const [bookingType, setBookingType] = useState(booking.booking_type);
  const [checkIn, setCheckIn] = useState(booking.check_in);
  const [checkOut, setCheckOut] = useState(booking.check_out);
  const [nights, setNights] = useState(booking.nights);

  // Room selection (structured) — mirrors the New Booking form
  const initialMode: "individual" | "group" = sel?.bookingType
    ? sel.bookingType
    : booking.booking_type === "INDIVIDUAL" ? "individual" : "group";
  const [roomMode, setRoomMode] = useState<"individual" | "group">(initialMode);
  const [isLodging, setIsLodging] = useState(sel?.isLodging ?? true);
  const [selectedRoom, setSelectedRoom] = useState(sel?.selectedRoom || "");
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>(sel?.roomQuantities || {});
  const [needsHall, setNeedsHall] = useState(sel?.needsHall ?? Number(booking.hall_amount || 0) > 0);
  const [selectedHall, setSelectedHall] = useState(sel?.selectedHall || "");
  const [hallDays, setHallDays] = useState(sel?.hallDays ?? (booking.hall_days || 1));
  const [needsGrounds, setNeedsGrounds] = useState(sel?.needsGrounds ?? false);

  // Manual amount fallback (legacy bookings with no stored selection, or custom override)
  const [manualMode, setManualMode] = useState(!hasSelection);
  const initialRoomAmount = booking.room_amount != null
    ? Number(booking.room_amount)
    : Math.max(0, Number(booking.total_amount) - Number(booking.hall_amount || 0) + Number(booking.discount_amount || 0));
  const [roomAmount, setRoomAmount] = useState(String(initialRoomAmount));
  const [hallAmount, setHallAmount] = useState(String(booking.hall_amount || 0));

  // Discount — pre-filled so it can be re-edited (not lost)
  const [discountType, setDiscountType] = useState<"amount" | "percent">(booking.discount_type === "percent" ? "percent" : "amount");
  const [discountValue, setDiscountValue] = useState(booking.discount_value ? String(booking.discount_value) : "");
  const [specialRequests, setSpecialRequests] = useState(booking.special_requests || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Live pricing
  const [HALL_OPTIONS, setHallOptions] = useState(DEFAULT_HALL_OPTIONS);
  const [WEDDING_GROUNDS_PRICE, setWeddingGroundsPrice] = useState(DEFAULT_WEDDING_GROUNDS_PRICE);
  useEffect(() => {
    fetch("/api/settings/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.halls?.length > 0 || data.kitchen?.length > 0) setHallOptions([...(data.halls || []), ...(data.kitchen || [])]);
        if (typeof data.wedding_grounds === "number") setWeddingGroundsPrice(data.wedding_grounds);
      })
      .catch(() => {});
  }, []);

  // Date/nights auto-sync
  useEffect(() => {
    if (checkIn && checkOut) {
      const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
      if (diff > 0 && diff !== nights) setNights(diff);
    }
  }, [checkOut]);
  useEffect(() => {
    if (checkIn && nights > 0) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + nights);
      setCheckOut(d.toISOString().split("T")[0]);
    }
  }, [checkIn, nights]);

  // Room price from structured selection
  const roomBreakdownLines = useMemo(() => {
    const lines: { label: string; calc: string; amount: number }[] = [];
    if (!isLodging) return lines;
    if (roomMode === "individual" && selectedRoom) {
      const room = ROOM_OPTIONS.find((r) => r.label === selectedRoom);
      if (room) lines.push({ label: room.label, calc: `GH₵${room.price} × ${nights} night${nights > 1 ? "s" : ""}`, amount: room.price * nights });
    } else if (roomMode === "group") {
      ROOM_OPTIONS.forEach((room) => {
        const qty = roomQuantities[room.label] || 0;
        if (qty > 0) lines.push({ label: `${room.label} × ${qty}`, calc: `GH₵${room.price} × ${qty} × ${nights}n`, amount: room.price * qty * nights });
      });
    }
    return lines;
  }, [isLodging, roomMode, selectedRoom, nights, roomQuantities]);

  const hallOption = HALL_OPTIONS.find((h) => h.label === selectedHall);
  const structuredRoomPrice = roomBreakdownLines.reduce((s, l) => s + l.amount, 0);
  const structuredHallPrice = (needsHall && hallOption ? hallOption.price * hallDays : 0) + (needsGrounds ? WEDDING_GROUNDS_PRICE : 0);

  const roomPrice = manualMode ? (parseFloat(roomAmount) || 0) : structuredRoomPrice;
  const hallPrice = manualMode ? (parseFloat(hallAmount) || 0) : structuredHallPrice;
  const subtotal = roomPrice + hallPrice;

  const discountAmt = (() => {
    const v = parseFloat(discountValue) || 0;
    if (v <= 0) return 0;
    if (discountType === "percent") return Math.min(subtotal, (subtotal * v) / 100);
    return Math.min(subtotal, v);
  })();
  const finalTotal = Math.max(0, subtotal - discountAmt);

  const handleSave = async () => {
    if (!checkIn || !checkOut) { setError("Check-in and check-out dates are required."); return; }
    if (finalTotal <= 0) { setError("Total must be greater than zero. Select a room/hall or enter an amount."); return; }
    setSubmitting(true);
    setError("");
    try {
      const oldPaid = Number(booking.paid_amount) || 0;
      const bal = Math.max(0, finalTotal - oldPaid);
      const payStatus: Booking["payment_status"] = oldPaid >= finalTotal && finalTotal > 0 ? "PAID" : oldPaid > 0 ? "PARTIAL" : "UNPAID";

      const selection: BookingSelection | null = manualMode ? null : {
        bookingType: roomMode,
        isLodging,
        selectedRoom: roomMode === "individual" ? selectedRoom : undefined,
        roomQuantities: roomMode === "group" ? roomQuantities : undefined,
        needsHall, selectedHall, hallDays, needsGrounds,
      };

      await updateBookingFull(booking.id, {
        status,
        source,
        booking_type: bookingType,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        total_amount: finalTotal,
        room_amount: roomPrice,
        subtotal,
        hall_amount: hallPrice,
        hall_days: needsHall || manualMode ? hallDays : 0,
        discount_type: discountAmt > 0 ? discountType : null,
        discount_value: discountAmt > 0 ? parseFloat(discountValue) || 0 : 0,
        discount_amount: discountAmt,
        selection,
        balance: bal,
        payment_status: payStatus,
        special_requests: specialRequests || null,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking {booking.reference}</DialogTitle>
          <DialogDescription>{booking.guest?.full_name} &bull; {booking.guest?.phone}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status + Source + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Booking Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Booking["status"])}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(BOOKING_STATUS_CONFIG).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v as Booking["source"])}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Walk-in</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Booking Type</Label>
              <Select value={bookingType} onValueChange={(v) => {
                const bt = v as Booking["booking_type"];
                setBookingType(bt);
                setRoomMode(bt === "INDIVIDUAL" ? "individual" : "group");
              }}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="GROUP">Group</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Check-in</Label>
              <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Check-out</Label>
              <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nights</Label>
              <NumberStepper value={nights} onChange={setNights} min={1} max={90} />
            </div>
          </div>

          {/* Pricing mode toggle */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <BedDouble className="h-4 w-4 text-sidebar-primary" /> Rooms &amp; Pricing
            </h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => setManualMode(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${!manualMode ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary" : "border-border text-muted-foreground hover:border-sidebar-primary/40"}`}>
                Select rooms
              </button>
              <button type="button" onClick={() => setManualMode(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${manualMode ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary" : "border-border text-muted-foreground hover:border-sidebar-primary/40"}`}>
                Enter amounts
              </button>
            </div>
          </div>

          {!manualMode ? (
            <div className="space-y-4 rounded-xl border border-border/60 bg-card p-4">
              {/* Lodging toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Lodging / rooms</Label>
                <div className="flex gap-2">
                  {([true, false] as const).map((opt) => (
                    <button key={String(opt)} type="button" onClick={() => setIsLodging(opt)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${isLodging === opt ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary" : "border-border text-muted-foreground hover:border-sidebar-primary/40"}`}>
                      {opt ? "Yes" : "No rooms"}
                    </button>
                  ))}
                </div>
              </div>

              {isLodging && (roomMode === "individual" ? (
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select a room type</option>
                  {ROOM_OPTIONS.map((r) => (<option key={r.label} value={r.label}>{r.label} — GH₵{r.price}/night</option>))}
                </select>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROOM_OPTIONS.map((r) => (
                    <div key={r.label} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                      <div>
                        <p className="text-xs font-medium">{r.label}</p>
                        <p className="text-[10px] text-muted-foreground">GH₵{r.price}/night</p>
                      </div>
                      <NumberStepper value={roomQuantities[r.label] || 0} onChange={(val) => setRoomQuantities((prev) => ({ ...prev, [r.label]: val }))} min={0} max={20} />
                    </div>
                  ))}
                </div>
              ))}

              {/* Hall (group/event) */}
              {roomMode === "group" && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-1.5"><Church className="h-3.5 w-3.5 text-sidebar-primary" /> Hall / Venue</Label>
                    <div className="flex gap-2">
                      {([true, false] as const).map((opt) => (
                        <button key={String(opt)} type="button" onClick={() => setNeedsHall(opt)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${needsHall === opt ? "border-sidebar-primary bg-sidebar-primary/10 text-sidebar-primary" : "border-border text-muted-foreground hover:border-sidebar-primary/40"}`}>
                          {opt ? "Yes" : "No hall"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {needsHall && (
                    <div className="space-y-2">
                      <select value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="">Select a hall</option>
                        {HALL_OPTIONS.map((h) => (<option key={h.label} value={h.label}>{h.label} — GH₵{h.price}/day</option>))}
                      </select>
                      <div className="flex items-center gap-3">
                        <Label className="text-xs whitespace-nowrap">Hall days:</Label>
                        <NumberStepper value={hallDays} onChange={setHallDays} min={1} max={30} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="edit-wedding" checked={needsGrounds} onChange={(e) => setNeedsGrounds(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-sidebar-primary focus:ring-sidebar-primary" />
                    <Label htmlFor="edit-wedding" className="text-xs cursor-pointer">Wedding Grounds (GH₵{WEDDING_GROUNDS_PRICE.toLocaleString()})</Label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-card p-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Room/Lodging Amount (GH₵)</Label>
                <Input type="number" min="0" step="0.01" value={roomAmount} onChange={(e) => setRoomAmount(e.target.value)} className="h-9" placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hall Amount (GH₵)</Label>
                <Input type="number" min="0" step="0.01" value={hallAmount} onChange={(e) => setHallAmount(e.target.value)} className="h-9" placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hall Days</Label>
                <Input type="number" min="0" value={hallDays} onChange={(e) => setHallDays(Number(e.target.value))} className="h-9" />
              </div>
            </div>
          )}

          {/* Discount + totals */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Rooms</span>
              <span className="tabular-nums">{formatCurrency(roomPrice)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Halls / Grounds</span>
              <span className="tabular-nums">{formatCurrency(hallPrice)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-border/40">
              <span>Subtotal (before discount)</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>

            <div className="space-y-2 pt-1 border-t border-border/40">
              <Label className="text-xs text-muted-foreground">Discount (optional)</Label>
              <div className="flex gap-2 items-end">
                <div className="flex rounded-lg border border-border/60 overflow-hidden text-xs">
                  <button type="button" onClick={() => setDiscountType("amount")}
                    className={`px-3 py-1.5 font-medium transition-colors ${discountType === "amount" ? "bg-sidebar-primary/10 text-sidebar-primary" : "text-muted-foreground hover:bg-muted/50"}`}>GH₵</button>
                  <button type="button" onClick={() => setDiscountType("percent")}
                    className={`px-3 py-1.5 font-medium transition-colors ${discountType === "percent" ? "bg-sidebar-primary/10 text-sidebar-primary" : "text-muted-foreground hover:bg-muted/50"}`}>%</button>
                </div>
                <Input type="number" min="0" step="0.01" placeholder={discountType === "amount" ? "Enter amount" : "Enter %"}
                  value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="h-9 flex-1" />
              </div>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Discount {discountType === "percent" ? `(${discountValue}%)` : ""}</span>
                <span className="text-red-400 tabular-nums">-{formatCurrency(discountAmt)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/40">
              <span>Total</span>
              <span className="text-teal-500 tabular-nums">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-1.5">
            <Label className="text-xs">Special Requests</Label>
            <Textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} placeholder="Any special requests or notes..." className="resize-none" />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Record Payment Dialog ────────────────────────────────────────────

type PaymentLine = { amount: string; method: string; account_id: string };

function RecordPaymentDialog({
  booking,
  accounts,
  onOpenChange,
  onSuccess,
}: {
  booking: BookingWithGuest;
  accounts: FinanceAccount[];
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
}) {
  const balance = Math.max(0, Number(booking.total_amount) - Number(booking.paid_amount));
  const [lines, setLines] = useState<PaymentLine[]>([{ amount: balance > 0 ? String(balance) : "", method: "CASH", account_id: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalEntered = lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);
  const activeAccounts = accounts.filter((a) => a.is_active);

  const updateLine = (i: number, field: keyof PaymentLine, value: string) => {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLines((prev) => [...prev, { amount: "", method: "CASH", account_id: "" }]);

  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (totalEntered <= 0) { setError("Enter at least one payment amount."); return; }
    setSubmitting(true);
    setError("");
    try {
      // Single endpoint keeps payments page, bookings, and accounting in sync:
      // inserts a payment row + finance record per line and updates the booking.
      const res = await fetch("/api/payments/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          amount: totalEntered,
          status: "COMPLETED",
          payment_lines: lines
            .filter((l) => (parseFloat(l.amount) || 0) > 0)
            .map((l) => ({ amount: parseFloat(l.amount) || 0, method: l.method, account_id: l.account_id || null })),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to record payment");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Booking {booking.reference} &bull; {booking.guest?.full_name} &bull; Balance: <strong className="text-sidebar-primary">GH₵{balance.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Amount (GH₵)</Label>}
                <Input type="number" min="0" step="0.01" placeholder="0.00" value={line.amount}
                  onChange={(e) => updateLine(i, "amount", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Method</Label>}
                <Select value={line.method || ""} onValueChange={(v) => updateLine(i, "method", v ?? "CASH")}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_METHOD_LABELS).filter(([k]) => k !== "PAYSTACK").map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" className="text-red-500 mt-5"
                onClick={() => removeLine(i)} disabled={lines.length === 1}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          {activeAccounts.length > 0 && lines.map((line, i) => (
            <div key={`acc-${i}`} className="space-y-1">
              <Label className="text-xs">Account for line {i + 1}</Label>
              <Select value={line.account_id || ""} onValueChange={(v) => updateLine(i, "account_id", v ?? "")}>
                <SelectTrigger className="h-9"><SelectValue placeholder="No account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No account</SelectItem>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={addLine}>
            <Plus className="h-3.5 w-3.5" /> Add Payment Line
          </Button>

          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/60">
            <span>Total being recorded</span>
            <span className="text-teal-500">GH₵{totalEntered.toFixed(2)}</span>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || totalEntered <= 0}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { data: bookings, loading, refetch } = useSupabaseQuery(() => getBookings(), []);
  const { data: guests } = useSupabaseQuery(() => getGuests(), []);
  const [typeTab, setTypeTab] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<BookingWithGuest | null>(null);
  const [viewItem, setViewItem] = useState<BookingWithGuest | null>(null);
  const [deleteItem, setDeleteItem] = useState<BookingWithGuest | null>(null);
  const [payItem, setPayItem] = useState<BookingWithGuest | null>(null);
  const [assignItem, setAssignItem] = useState<BookingWithGuest | null>(null);
  const { data: accounts } = useSupabaseQuery(() => getFinanceAccounts(), []);
  const { data: rooms } = useSupabaseQuery(() => getRooms(), []);
  const { pendingIds, scheduleDelete } = useUndoableDelete(refetch);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" /></div>;
  }

  const allBookings = (bookings || []) as BookingWithGuest[];
  const allGuests = guests || [];

  const filtered = allBookings.filter((b) => {
    if (pendingIds.has(b.id)) return false;
    if (typeTab !== "ALL" && b.booking_type !== typeTab) return false;
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.reference.toLowerCase().includes(q) || b.guest?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const typeCounts = { ALL: allBookings.length, INDIVIDUAL: allBookings.filter(b => b.booking_type === "INDIVIDUAL").length, GROUP: allBookings.filter(b => b.booking_type === "GROUP").length, EVENT: allBookings.filter(b => b.booking_type === "EVENT").length };


  const handleDelete = () => {
    if (!deleteItem) return;
    const item = deleteItem;
    setDeleteItem(null);
    scheduleDelete({
      id: item.id,
      label: `Booking ${item.reference}`,
      performDelete: () => deleteBooking(item.id),
    });
  };

  const columns: Column<BookingWithGuest>[] = [
    { header: "Reference", accessor: (b) => {
      const online = b.source === "WEBSITE";
      const unpaidOnline = online && Number(b.paid_amount || 0) <= 0 && b.status !== "CANCELLED";
      return (
      <div className="space-y-0.5">
        <span className="ref-code text-sm">{b.reference}</span>
        <div className="flex flex-wrap gap-1">
          {/* Source: distinguishes a self-service website booking from one an admin entered */}
          <span className={`flex w-fit items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
            online ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-muted text-muted-foreground border-border/60"
          }`}>
            {online ? "Online" : b.source === "WALK_IN" ? "Walk-in" : b.source === "PHONE" ? "Phone" : b.source === "AGENT" ? "Agent" : "Admin"}
          </span>
          {unpaidOnline && (
            <span className="flex w-fit items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20" title="Booked on the website but payment not completed — a good candidate to follow up">
              Unpaid · follow up
            </span>
          )}
          {Number(b.discount_amount || 0) > 0 && (
            <span className="flex w-fit items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20" title={`Discount applied: ${formatCurrency(Number(b.discount_amount))}`}>
              <Tag className="h-2.5 w-2.5" />Discounted
            </span>
          )}
        </div>
      </div>
      );
    }},
    { header: "Guest", accessor: (b) => (
      <div>
        <p className="font-medium">{b.guest?.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{b.guest?.phone ?? "—"}</p>
      </div>
    )},
    { header: "Check-in", accessor: (b) => <span className="text-sm">{formatDate(b.check_in)}</span> },
    { header: "Check-out", accessor: (b) => <span className="text-sm">{formatDate(b.check_out)}</span> },
    { header: "Payment", accessor: (b) => {
      const total = Number(b.total_amount);
      const paid = Number(b.paid_amount);
      const bal = Number(b.balance);
      const payStatus = b.payment_status;
      if (payStatus === "REFUNDED") return (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold tabular-nums">{formatCurrency(total)}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Refunded</span>
        </div>
      );
      if (!paid || paid === 0) return (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold tabular-nums">{formatCurrency(total)}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Unpaid</span>
        </div>
      );
      if (paid >= total) return (
        <div className="space-y-0.5">
          <p className="text-xs font-semibold tabular-nums text-teal-500">{formatCurrency(paid)}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">Fully Paid</span>
        </div>
      );
      return (
        <div className="space-y-0.5">
          <p className="text-xs tabular-nums"><span className="font-semibold text-amber-400">{formatCurrency(paid)}</span><span className="text-muted-foreground text-[10px]"> / {formatCurrency(total)}</span></p>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Partial &bull; bal {formatCurrency(bal)}</span>
        </div>
      );
    }},
    { header: "Rooms", accessor: (b) => {
      const count = b.room_ids?.length || 0;
      return count > 0 ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20">
          <BedDouble className="h-2.5 w-2.5" />{count} room{count === 1 ? "" : "s"}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">Unassigned</span>
      );
    }},
    { header: "Status", accessor: (b) => <StatusBadge status={b.status} config={BOOKING_STATUS_CONFIG} /> },
    { header: "Actions", accessor: (b) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setViewItem(b); }}><Eye className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" title="Assign Rooms" className="text-sidebar-primary" onClick={(e) => { e.stopPropagation(); setAssignItem(b); }}><BedDouble className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" title="Record Payment" className="text-teal-600 hover:text-teal-700" onClick={(e) => { e.stopPropagation(); setPayItem(b); }}><CreditCard className="h-3.5 w-3.5" /></Button>
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

      {/* Booking type tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {([
          { key: "ALL", label: "All Bookings", icon: Users },
          { key: "INDIVIDUAL", label: "Individual", icon: User },
          { key: "GROUP", label: "Group", icon: Users },
          { key: "EVENT", label: "Event", icon: Church },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTypeTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
              typeTab === key ? "bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20 shadow-sm" : "bg-card text-muted-foreground border-border/60 hover:bg-muted/50"
            }`}>
            <Icon className="h-3.5 w-3.5" />{label}
            <span className="ml-0.5 text-[10px] font-bold">{typeCounts[key]}</span>
          </button>
        ))}
      </div>

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

      {/* Record Payment Dialog */}
      {payItem && (
        <RecordPaymentDialog
          booking={payItem}
          accounts={accounts || []}
          onOpenChange={(o) => !o && setPayItem(null)}
          onSuccess={() => { setPayItem(null); refetch(); }}
        />
      )}

      {/* Assign Rooms Dialog */}
      {assignItem && (
        <AssignRoomsDialog
          booking={assignItem}
          allRooms={rooms || []}
          allBookings={allBookings}
          onClose={() => setAssignItem(null)}
          onSaved={() => { setAssignItem(null); refetch(); }}
        />
      )}

      {/* Edit Dialog */}
      {editItem && (
        <EditBookingDialog
          booking={editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          onSuccess={() => { setEditItem(null); refetch(); }}
        />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Booking {viewItem?.reference}</DialogTitle></DialogHeader>
          {viewItem && (() => {
            const vTotal = Number(viewItem.total_amount);
            const vPaid = Number(viewItem.paid_amount);
            const vBal = Number(viewItem.balance);
            const vPS = viewItem.payment_status;
            const payColor = vPS === "PAID" ? "text-teal-400" : vPS === "PARTIAL" ? "text-amber-400" : vPS === "REFUNDED" ? "text-purple-400" : "text-red-400";
            const payLabel = vPS === "PAID" ? "Fully Paid" : vPS === "PARTIAL" ? "Partial Payment" : vPS === "REFUNDED" ? "Refunded" : "Unpaid";
            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Guest</p><p className="font-medium">{viewItem.guest?.full_name}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p><p>{viewItem.guest?.phone ?? "—"}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-in</p><p>{formatDate(viewItem.check_in)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-out</p><p>{formatDate(viewItem.check_out)}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Nights</p><p>{viewItem.nights}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p><p>{viewItem.booking_type}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Source</p><p>{viewItem.source}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Booking Status</p><StatusBadge status={viewItem.status} config={BOOKING_STATUS_CONFIG} /></div>
                </div>
                {/* Payment summary */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
                  {Number(viewItem.discount_amount || 0) > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Subtotal</span>
                        <span className="tabular-nums text-muted-foreground">{formatCurrency(Number(viewItem.subtotal || vTotal + Number(viewItem.discount_amount || 0)))}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wide text-violet-400 flex items-center gap-1"><Tag className="h-3 w-3" />Discount{viewItem.discount_type === "percent" ? ` (${viewItem.discount_value}%)` : ""}</span>
                        <span className="tabular-nums text-violet-400">-{formatCurrency(Number(viewItem.discount_amount))}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Amount</span>
                    <span className="font-bold tabular-nums">{formatCurrency(vTotal)}</span>
                  </div>
                  {vPaid > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Amount Paid</span>
                      <span className={`font-semibold tabular-nums ${payColor}`}>{formatCurrency(vPaid)}</span>
                    </div>
                  )}
                  {vBal > 0 && (
                    <div className="flex justify-between items-center border-t border-border/60 pt-2">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Balance Due</span>
                      <span className="font-bold tabular-nums text-red-400">{formatCurrency(vBal)}</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      vPS === "PAID" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                      vPS === "PARTIAL" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      vPS === "REFUNDED" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>{payLabel}</span>
                  </div>
                </div>
                {viewItem.special_requests && (
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Special Requests</p><p className="text-sm mt-0.5">{viewItem.special_requests}</p></div>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
            <Button variant="outline" onClick={() => { setPayItem(viewItem); setViewItem(null); }} className="text-teal-600"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Record Payment</Button>
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
            <p>Delete booking <strong>{deleteItem?.reference}</strong>? You&apos;ll have a few seconds to undo.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
