import {
  CalendarCheck,
  LogIn,
  LogOut,
  BedDouble,
  DoorOpen,
  SprayCan,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MessageSquareWarning,
  Percent,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoomStatusOverview } from "@/components/dashboard/room-status-overview";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { CURRENCY } from "@/lib/constants";

// TODO: Replace with real data from database
// Using realistic demo data for now so the dashboard looks production-ready
const stats = {
  bookingsToday: 8,
  expectedCheckIns: 5,
  expectedCheckOuts: 3,
  occupiedRooms: 32,
  availableRooms: 15,
  dirtyRooms: 4,
  totalRooms: 56,
  pendingPayments: 6,
  incomeToday: 4850,
  expensesToday: 1200,
  openComplaints: 3,
  occupancyRate: 57,
};

const roomStatusData = [
  { status: "AVAILABLE", count: 15 },
  { status: "OCCUPIED", count: 32 },
  { status: "DIRTY", count: 4 },
  { status: "CLEANING", count: 2 },
  { status: "AWAITING_INSPECTION", count: 1 },
  { status: "MAINTENANCE", count: 2 },
];

const recentBookings = [
  {
    id: "1",
    bookingReference: "WPTC-2026-0421",
    guestName: "Rev. Kwame Mensah",
    roomNumbers: ["101", "102"],
    checkInDate: new Date("2026-05-10"),
    checkOutDate: new Date("2026-05-14"),
    status: "CHECKED_IN",
    totalAmount: 2400,
  },
  {
    id: "2",
    bookingReference: "WPTC-2026-0422",
    guestName: "Grace Assembly Youth",
    roomNumbers: ["201", "202", "203", "204"],
    checkInDate: new Date("2026-05-11"),
    checkOutDate: new Date("2026-05-13"),
    status: "CONFIRMED",
    totalAmount: 6400,
  },
  {
    id: "3",
    bookingReference: "WPTC-2026-0423",
    guestName: "Pastor Ama Boateng",
    roomNumbers: ["305"],
    checkInDate: new Date("2026-05-10"),
    checkOutDate: new Date("2026-05-12"),
    status: "PENDING",
    totalAmount: 800,
  },
  {
    id: "4",
    bookingReference: "WPTC-2026-0424",
    guestName: "Dr. Yaw Asante",
    roomNumbers: ["108"],
    checkInDate: new Date("2026-05-09"),
    checkOutDate: new Date("2026-05-10"),
    status: "CHECKED_OUT",
    totalAmount: 600,
  },
  {
    id: "5",
    bookingReference: "WPTC-2026-0425",
    guestName: "Faith Chapel Retreat",
    roomNumbers: ["401", "402", "403"],
    checkInDate: new Date("2026-05-12"),
    checkOutDate: new Date("2026-05-15"),
    status: "CONFIRMED",
    totalAmount: 5400,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of today&apos;s operations at Warriors Prayer Tower Complex
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bookings Today"
          value={stats.bookingsToday}
          subtitle="Active bookings"
          icon={CalendarCheck}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Check-ins Expected"
          value={stats.expectedCheckIns}
          subtitle="Arriving today"
          icon={LogIn}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Check-outs Expected"
          value={stats.expectedCheckOuts}
          subtitle="Departing today"
          icon={LogOut}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          subtitle={`${stats.occupiedRooms} of ${stats.totalRooms} rooms`}
          icon={Percent}
          trend={{ value: 5, label: "vs last week" }}
          iconClassName="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Rooms"
          value={stats.availableRooms}
          icon={DoorOpen}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Rooms to Clean"
          value={stats.dirtyRooms}
          subtitle="Needs attention"
          icon={SprayCan}
          iconClassName="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Income Today"
          value={`${CURRENCY.symbol}${stats.incomeToday.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 12, label: "vs yesterday" }}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          subtitle="Awaiting payment"
          icon={CreditCard}
          iconClassName="bg-red-50 text-red-600"
        />
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room status breakdown — left 1/3 */}
        <RoomStatusOverview
          data={roomStatusData}
          totalRooms={stats.totalRooms}
        />

        {/* Recent bookings — right 2/3 */}
        <div className="lg:col-span-2">
          <RecentBookings bookings={recentBookings} />
        </div>
      </div>
    </div>
  );
}
