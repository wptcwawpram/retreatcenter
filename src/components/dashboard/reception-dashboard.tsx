"use client";

import Link from "next/link";
import {
  LogIn, LogOut, DoorOpen, CalendarCheck, Users, BedDouble,
  Percent, ArrowRight, Loader2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoomStatusOverview } from "@/components/dashboard/room-status-overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getBookings } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";

export function ReceptionDashboard({ greeting }: { greeting: string }) {
  const { data: stats, loading: statsLoading } = useSupabaseQuery(() => getDashboardStats(), []);
  const { data: bookings } = useSupabaseQuery(() => getBookings(), []);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading reception dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats || {
    bookingsToday: 0, expectedCheckIns: 0, expectedCheckOuts: 0, occupancyRate: 0,
    occupiedRooms: 0, totalRooms: 0, availableRooms: 0, dirtyRooms: 0,
    incomeToday: 0, pendingPayments: 0, openComplaints: 0,
    roomStatusData: [], cleaningRooms: 0, maintenanceRooms: 0,
  };

  const recentBookings = (bookings || []).slice(0, 8).map((b) => ({
    id: b.id,
    bookingReference: b.reference,
    guestName: b.guest?.full_name || "Unknown",
    roomNumbers: [] as string[],
    checkInDate: new Date(b.check_in),
    checkOutDate: new Date(b.check_out),
    status: b.status,
    totalAmount: Number(b.total_amount),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Reception overview &mdash; manage check-ins, bookings, and room availability</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/bookings">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <CalendarCheck className="h-3.5 w-3.5" />New Booking
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Check-ins Today" value={s.expectedCheckIns} subtitle="Expected arrivals" icon={LogIn} iconClassName="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Check-outs Today" value={s.expectedCheckOuts} subtitle="Expected departures" icon={LogOut} iconClassName="bg-amber-500/10 text-amber-600" />
        <StatCard title="Available Rooms" value={s.availableRooms} subtitle={`of ${s.totalRooms} total`} icon={DoorOpen} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatCard title="Occupancy" value={`${s.occupancyRate}%`} subtitle={`${s.occupiedRooms} occupied`} icon={Percent} iconClassName="bg-primary/10 text-primary" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Active Bookings" value={s.bookingsToday} icon={CalendarCheck} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatCard title="Guests Today" value={s.expectedCheckIns + s.occupiedRooms} icon={Users} iconClassName="bg-purple-500/10 text-purple-600" />
        <StatCard title="Rooms to Clean" value={s.dirtyRooms} icon={BedDouble} iconClassName="bg-orange-500/10 text-orange-600" />
        <StatCard title="Pending Payments" value={s.pendingPayments} icon={CalendarCheck} iconClassName="bg-red-500/10 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RoomStatusOverview data={s.roomStatusData} totalRooms={s.totalRooms} />
        <div className="lg:col-span-2">
          <RecentBookings bookings={recentBookings} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/dashboard/bookings" className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-border transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Manage Bookings</p>
              <p className="text-xs text-muted-foreground mt-0.5">View, edit, and process bookings</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
        <Link href="/dashboard/guests" className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-border transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Guest Directory</p>
              <p className="text-xs text-muted-foreground mt-0.5">Search and manage guest records</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
        <Link href="/dashboard/rooms" className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-border transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Room Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">View and update room availability</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
