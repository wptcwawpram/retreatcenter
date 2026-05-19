"use client";

import {
  CalendarCheck,
  LogIn,
  LogOut,
  DoorOpen,
  SprayCan,
  CreditCard,
  TrendingUp,
  Percent,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoomStatusOverview } from "@/components/dashboard/room-status-overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { CURRENCY } from "@/lib/constants";
import { getDashboardStats, getBookings } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useSupabaseQuery(() => getDashboardStats(), []);
  const { data: bookings, loading: bookingsLoading } = useSupabaseQuery(() => getBookings(), []);

  const recentBookings = (bookings || []).slice(0, 5).map((b) => ({
    id: b.id,
    bookingReference: b.reference,
    guestName: b.guest?.full_name || "Unknown",
    roomNumbers: [] as string[],
    checkInDate: new Date(b.check_in),
    checkOutDate: new Date(b.check_out),
    status: b.status,
    totalAmount: Number(b.total_amount),
  }));

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const s = stats || {
    bookingsToday: 0, expectedCheckIns: 0, expectedCheckOuts: 0, occupancyRate: 0,
    occupiedRooms: 0, totalRooms: 0, availableRooms: 0, dirtyRooms: 0,
    incomeToday: 0, pendingPayments: 0, openComplaints: 0,
    roomStatusData: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of today&apos;s operations at Warriors Prayer Tower Complex
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bookings Today" value={s.bookingsToday} subtitle="Active bookings" icon={CalendarCheck} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard title="Check-ins Expected" value={s.expectedCheckIns} subtitle="Arriving today" icon={LogIn} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Check-outs Expected" value={s.expectedCheckOuts} subtitle="Departing today" icon={LogOut} iconClassName="bg-amber-50 text-amber-600" />
        <StatCard title="Occupancy Rate" value={`${s.occupancyRate}%`} subtitle={`${s.occupiedRooms} of ${s.totalRooms} rooms`} icon={Percent} iconClassName="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available Rooms" value={s.availableRooms} icon={DoorOpen} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Rooms to Clean" value={s.dirtyRooms} subtitle="Needs attention" icon={SprayCan} iconClassName="bg-orange-50 text-orange-600" />
        <StatCard title="Income Today" value={`${CURRENCY.symbol}${s.incomeToday.toLocaleString()}`} icon={TrendingUp} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Pending Payments" value={s.pendingPayments} subtitle="Awaiting payment" icon={CreditCard} iconClassName="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RoomStatusOverview data={s.roomStatusData} totalRooms={s.totalRooms} />
        <div className="lg:col-span-2">
          <RecentBookings bookings={recentBookings} />
        </div>
      </div>
    </div>
  );
}
