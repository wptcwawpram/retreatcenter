"use client";

import { useState, useMemo, useCallback } from "react";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { getRooms, getBookings } from "@/lib/supabase/queries";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  Users,
  User,
  Eye,
  X,
} from "lucide-react";
import type { Room, Booking, Guest } from "@/lib/supabase/types";
import Link from "next/link";

type BookingWithGuest = Booking & { guest: Guest };

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getMonday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatDayHeader(dateStr: string): { day: string; date: string; isToday: boolean; isWeekend: boolean } {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    day: days[d.getDay()],
    date: d.getDate().toString(),
    isToday: dateStr === todayStr(),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
  };
}

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/70 border-amber-400/50",
  CONFIRMED: "bg-blue-500/70 border-blue-400/50",
  CHECKED_IN: "bg-teal-500/70 border-teal-400/50",
  CHECKED_OUT: "bg-gray-500/50 border-gray-400/30",
  CANCELLED: "bg-red-500/30 border-red-400/20 opacity-50",
  NO_SHOW: "bg-red-500/30 border-red-400/20 opacity-50",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

const ROOM_TYPE_SHORT: Record<string, string> = {
  "2_IN_1": "2-in-1",
  "4_IN_1": "4-in-1",
  "6_IN_1": "6-in-1",
  SUITE_FAN: "Suite (Fan)",
  SUITE_AC: "Suite (AC)",
  APARTMENT: "Apartment",
  "3_IN_1": "3-in-1",
  KITCHEN: "Kitchen",
};

type ViewMode = "week" | "2week" | "month";

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("2week");
  const [startDate, setStartDate] = useState(() => getMonday(todayStr()));
  const [selectedBooking, setSelectedBooking] = useState<BookingWithGuest | null>(null);

  const { data: rooms, loading: roomsLoading } = useSupabaseQuery(getRooms, []);
  const { data: bookings, loading: bookingsLoading } = useSupabaseQuery(getBookings, []);

  const loading = roomsLoading || bookingsLoading;

  const daysCount = viewMode === "week" ? 7 : viewMode === "2week" ? 14 : 30;
  const endDate = addDays(startDate, daysCount);

  const dates = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < daysCount; i++) {
      arr.push(addDays(startDate, i));
    }
    return arr;
  }, [startDate, daysCount]);

  const sortedRooms = useMemo(() => {
    if (!rooms) return [];
    return [...rooms]
      .filter((r) => r.type !== "KITCHEN")
      .sort((a, b) => {
        const typeOrder = ["2_IN_1", "4_IN_1", "6_IN_1", "3_IN_1", "SUITE_FAN", "SUITE_AC", "APARTMENT"];
        const ai = typeOrder.indexOf(a.type);
        const bi = typeOrder.indexOf(b.type);
        if (ai !== bi) return ai - bi;
        return a.number.localeCompare(b.number);
      });
  }, [rooms]);

  const bookingsByRoom = useMemo(() => {
    if (!bookings) return {};
    const map: Record<string, BookingWithGuest[]> = {};
    (bookings as BookingWithGuest[]).forEach((b) => {
      if (b.status === "CANCELLED" || b.status === "NO_SHOW") return;
      if (!datesOverlap(b.check_in, b.check_out, startDate, endDate)) return;
      (b.room_ids || []).forEach((rid) => {
        if (!map[rid]) map[rid] = [];
        map[rid].push(b);
      });
    });
    return map;
  }, [bookings, startDate, endDate]);

  const navigate = useCallback((direction: number) => {
    setStartDate((prev) => addDays(prev, direction * daysCount));
  }, [daysCount]);

  const goToToday = useCallback(() => {
    setStartDate(getMonday(todayStr()));
  }, []);

  const getBookingForCell = (roomId: string, date: string): BookingWithGuest | null => {
    const roomBookings = bookingsByRoom[roomId];
    if (!roomBookings) return null;
    return roomBookings.find((b) => b.check_in <= date && b.check_out > date) || null;
  };

  const isBookingStart = (booking: BookingWithGuest, date: string): boolean => {
    return booking.check_in === date || date === startDate && booking.check_in < startDate;
  };

  const getBookingSpan = (booking: BookingWithGuest, date: string): number => {
    const effectiveEnd = booking.check_out > endDate ? endDate : booking.check_out;
    const effectiveStart = date;
    const start = new Date(effectiveStart + "T00:00:00");
    const end = new Date(effectiveEnd + "T00:00:00");
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Calendar</h1>
          <p className="text-sm text-muted-foreground">
            {formatMonthYear(startDate)} — Room occupancy overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-border/50 rounded-lg overflow-hidden">
            {(["week", "2week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === mode
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {mode === "week" ? "1 Week" : mode === "2week" ? "2 Weeks" : "Month"}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs">
            <CalendarIcon className="h-3.5 w-3.5 mr-1" />Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(1)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Link href="/dashboard/bookings">
            <Button size="sm" className="h-8 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 text-xs">
              + New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px]">
        <span className="text-muted-foreground">Status:</span>
        {["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-2.5 rounded-sm border", STATUS_COLORS[s])} />
            <span className="text-muted-foreground">{STATUS_LABELS[s]}</span>
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto border border-border/50 rounded-lg bg-card/30">
        <div className="min-w-[800px]">
          {/* Date headers */}
          <div className="flex sticky top-0 z-20 bg-card border-b border-border/50">
            <div className="w-36 shrink-0 p-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-r border-border/50 flex items-end">
              Room
            </div>
            {dates.map((date) => {
              const h = formatDayHeader(date);
              return (
                <div
                  key={date}
                  className={cn(
                    "flex-1 min-w-[48px] p-1.5 text-center border-r border-border/30 last:border-r-0",
                    h.isToday && "bg-sidebar-primary/10",
                    h.isWeekend && !h.isToday && "bg-muted/20"
                  )}
                >
                  <p className={cn("text-[10px] font-medium", h.isToday ? "text-sidebar-primary" : "text-muted-foreground")}>
                    {h.day}
                  </p>
                  <p className={cn(
                    "text-sm font-bold",
                    h.isToday ? "text-sidebar-primary" : "text-foreground"
                  )}>
                    {h.date}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Room rows */}
          {sortedRooms.map((room, ri) => {
            const rendered = new Set<string>();

            return (
              <div key={room.id} className={cn("flex border-b border-border/30", ri % 2 === 0 && "bg-muted/5")}>
                <div className="w-36 shrink-0 p-2 border-r border-border/50 flex flex-col justify-center">
                  <p className="text-xs font-bold truncate">{room.name || room.number}</p>
                  <p className="text-[10px] text-muted-foreground">{ROOM_TYPE_SHORT[room.type] || room.type}</p>
                </div>

                <div className="flex flex-1 relative">
                  {dates.map((date) => {
                    const booking = getBookingForCell(room.id, date);
                    const isStart = booking && isBookingStart(booking, date);

                    if (booking && !isStart) {
                      if (rendered.has(booking.id)) return (
                        <div key={date} className="flex-1 min-w-[48px]" />
                      );
                    }

                    if (booking && isStart) {
                      rendered.add(booking.id);
                      const span = getBookingSpan(booking, date);
                      const guestName = booking.guest?.full_name || "Guest";
                      const isGroup = booking.booking_type === "GROUP";

                      return (
                        <div
                          key={date}
                          className="absolute h-[calc(100%-4px)] top-[2px] z-10"
                          style={{
                            left: `${(dates.indexOf(date) / dates.length) * 100}%`,
                            width: `${(Math.min(span, dates.length - dates.indexOf(date)) / dates.length) * 100}%`,
                          }}
                        >
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className={cn(
                              "w-full h-full rounded-md border px-1.5 flex items-center gap-1 cursor-pointer transition-all hover:brightness-110 hover:shadow-md",
                              STATUS_COLORS[booking.status]
                            )}
                            title={`${guestName} — ${booking.reference}\n${booking.check_in} to ${booking.check_out}`}
                          >
                            {isGroup ? <Users className="h-3 w-3 text-white/80 shrink-0" /> : <User className="h-3 w-3 text-white/80 shrink-0" />}
                            <span className="text-[10px] font-medium text-white truncate">
                              {guestName}
                            </span>
                          </button>
                        </div>
                      );
                    }

                    const h = formatDayHeader(date);
                    return (
                      <div
                        key={date}
                        className={cn(
                          "flex-1 min-w-[48px] border-r border-border/15 last:border-r-0 min-h-[40px]",
                          h.isToday && "bg-sidebar-primary/5",
                          h.isWeekend && !h.isToday && "bg-muted/10"
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {sortedRooms.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No rooms found. Add rooms in the Rooms page first.
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Sidebar */}
      {selectedBooking && (
        <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-border/50 shadow-xl z-50 overflow-y-auto">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-bold text-sm">Booking Details</h3>
            <button onClick={() => setSelectedBooking(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium text-white border", STATUS_COLORS[selectedBooking.status])}>
                {STATUS_LABELS[selectedBooking.status]}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium border",
                selectedBooking.payment_status === "PAID" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                selectedBooking.payment_status === "PARTIAL" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {selectedBooking.payment_status}
              </span>
            </div>

            <div>
              <p className="font-mono text-sidebar-primary text-sm font-bold">{selectedBooking.reference}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedBooking.booking_type === "GROUP" ? "Group" : "Individual"} booking
                {selectedBooking.source !== "WEBSITE" && ` • ${selectedBooking.source.replace("_", " ").toLowerCase()}`}
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Guest</p>
                <p className="text-sm font-medium">{selectedBooking.guest?.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedBooking.guest?.phone}</p>
                {selectedBooking.guest?.email && (
                  <p className="text-xs text-muted-foreground">{selectedBooking.guest.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-in</p>
                  <p className="text-sm font-medium">{new Date(selectedBooking.check_in).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-out</p>
                  <p className="text-sm font-medium">{new Date(selectedBooking.check_out).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Nights</p>
                  <p className="text-sm font-medium">{selectedBooking.nights}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rooms</p>
                  <p className="text-sm font-medium">{selectedBooking.room_ids?.length || 0}</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{formatCurrency(Number(selectedBooking.total_amount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-teal-500">{formatCurrency(Number(selectedBooking.paid_amount))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium text-amber-400">{formatCurrency(Number(selectedBooking.balance))}</span>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="border-t border-border/50 pt-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Special Requests</p>
                  <p className="text-xs mt-1">{selectedBooking.special_requests}</p>
                </div>
              )}

              <Link href="/dashboard/bookings" className="block">
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  View in Bookings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
