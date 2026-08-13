"use client";

import {
  CalendarCheck, LogIn, LogOut, DoorOpen, SprayCan,
  CreditCard, TrendingUp, Percent, Loader2, AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoomStatusOverview } from "@/components/dashboard/room-status-overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { CURRENCY } from "@/lib/constants";
import { getDashboardStats, getBookings, getComplaints } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ReceptionDashboard } from "@/components/dashboard/reception-dashboard";
import { HousekeepingDashboard } from "@/components/dashboard/housekeeping-dashboard";
import { MaintenanceDashboard } from "@/components/dashboard/maintenance-dashboard";
import { FinanceDashboard } from "@/components/dashboard/finance-dashboard";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { role, loading: userLoading } = useCurrentUser();
  const greeting = getGreeting();

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (role === "RECEPTIONIST") return <ReceptionDashboard greeting={greeting} />;
  if (role === "HOUSEKEEPER") return <HousekeepingDashboard greeting={greeting} />;
  if (role === "MAINTENANCE") return <MaintenanceDashboard greeting={greeting} />;
  if (role === "ACCOUNTANT") return <FinanceDashboard greeting={greeting} />;

  return <AdminDashboard greeting={greeting} />;
}

function AdminDashboard({ greeting }: { greeting: string }) {
  const { data: stats, loading: statsLoading } = useSupabaseQuery(() => getDashboardStats(), []);
  const { data: bookings } = useSupabaseQuery(() => getBookings(), []);
  const { data: complaints } = useSupabaseQuery(() => getComplaints(), []);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const recentBookings = (bookings || []).slice(0, 6).map((b) => ({
    id: b.id,
    bookingReference: b.reference,
    guestName: b.guest?.full_name || "Unknown",
    roomNumbers: [] as string[],
    checkInDate: new Date(b.check_in),
    checkOutDate: new Date(b.check_out),
    status: b.status,
    totalAmount: Number(b.total_amount),
  }));

  const openComplaints = (complaints || []).filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS").length;

  const s = stats || {
    bookingsToday: 0, expectedCheckIns: 0, expectedCheckOuts: 0, occupancyRate: 0,
    occupiedRooms: 0, totalRooms: 0, availableRooms: 0, dirtyRooms: 0,
    incomeToday: 0, pendingPayments: 0, openComplaints: 0,
    roomStatusData: [], cleaningRooms: 0, maintenanceRooms: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Here&apos;s what&apos;s happening at WPTC today
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Occupancy" value={`${s.occupancyRate}%`} subtitle={`${s.occupiedRooms} of ${s.totalRooms} rooms`} icon={Percent} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="Check-ins Today" value={s.expectedCheckIns} subtitle="Expected arrivals" icon={LogIn} iconClassName="bg-primary/10 text-primary" />
        <StatCard title="Check-outs Today" value={s.expectedCheckOuts} subtitle="Expected departures" icon={LogOut} iconClassName="bg-amber-500/10 text-amber-600" />
        <StatCard title="Income Today" value={`${CURRENCY.symbol}${s.incomeToday.toLocaleString()}`} subtitle="Collected payments" icon={TrendingUp} iconClassName="bg-teal-500/10 text-teal-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Active Bookings" value={s.bookingsToday} icon={CalendarCheck} iconClassName="bg-blue-500/10 text-blue-600" />
        <StatCard title="Available Rooms" value={s.availableRooms} icon={DoorOpen} iconClassName="bg-teal-500/10 text-teal-500" />
        <StatCard title="Rooms to Clean" value={s.dirtyRooms} icon={SprayCan} iconClassName="bg-orange-500/10 text-orange-600" />
        <StatCard title="Pending Payments" value={s.pendingPayments} icon={CreditCard} iconClassName="bg-red-500/10 text-red-600" />
      </div>

      {(openComplaints > 0 || s.dirtyRooms > 2) && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-primary/5 border border-sidebar-primary/20 text-sidebar-primary">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            {openComplaints > 0 && <span className="font-semibold">{openComplaints} open complaint{openComplaints > 1 ? "s" : ""}</span>}
            {openComplaints > 0 && s.dirtyRooms > 2 && " and "}
            {s.dirtyRooms > 2 && <span className="font-semibold">{s.dirtyRooms} rooms need cleaning</span>}
            {" "}&mdash; needs attention
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RoomStatusOverview data={s.roomStatusData} totalRooms={s.totalRooms} />
        <div className="lg:col-span-2">
          <RecentBookings bookings={recentBookings} />
        </div>
      </div>
    </div>
  );
}
