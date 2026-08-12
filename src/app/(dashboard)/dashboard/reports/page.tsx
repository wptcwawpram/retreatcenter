"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/format";
import { getRooms, getBookings, getGuests, getFinanceRecords } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { BedDouble, TrendingUp, Users, Wallet, Calendar, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { data: rooms, loading: loadingRooms } = useSupabaseQuery(() => getRooms(), []);
  const { data: bookings, loading: loadingBookings } = useSupabaseQuery(() => getBookings(), []);
  const { data: guests, loading: loadingGuests } = useSupabaseQuery(() => getGuests(), []);
  const { data: finance, loading: loadingFinance } = useSupabaseQuery(() => getFinanceRecords(), []);

  const loading = loadingRooms || loadingBookings || loadingGuests || loadingFinance;

  const allRooms = rooms || [];
  const allBookings = bookings || [];
  const allGuests = guests || [];
  const allFinance = finance || [];

  // Occupancy
  const totalRooms = allRooms.length;
  const occupiedRooms = allRooms.filter((r) => r.status === "OCCUPIED").length;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Revenue
  const totalIncome = useMemo(() => allFinance.filter((f) => f.type === "INCOME").reduce((s, f) => s + Number(f.amount), 0), [allFinance]);
  const totalExpenses = useMemo(() => allFinance.filter((f) => f.type === "EXPENSE").reduce((s, f) => s + Number(f.amount), 0), [allFinance]);

  // Revenue by category
  const revenueByCategory = useMemo(() => {
    return Object.entries(
      allFinance.filter((f) => f.type === "INCOME").reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + Number(f.amount);
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]);
  }, [allFinance]);

  // Booking stats
  const checkedInCount = allBookings.filter((b) => b.status === "CHECKED_IN").length;
  const confirmedCount = allBookings.filter((b) => b.status === "CONFIRMED").length;

  // Room status breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allRooms.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [allRooms]);

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Reports" description="Analytics and insights for your operations" />
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  const barColors = ["bg-teal-400", "bg-blue-400", "bg-amber-400", "bg-purple-400", "bg-red-400"];

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Analytics and insights for your operations" />

      {/* Top-level stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Occupancy" value={`${occupancyPct}%`} subtitle={`${occupiedRooms} of ${totalRooms} rooms`} icon={BedDouble} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard title="Total Revenue" value={formatCurrency(totalIncome)} icon={TrendingUp} iconClassName="bg-teal-500/10 text-teal-500" />
        <StatCard title="Total Guests" value={allGuests.length} icon={Users} iconClassName="bg-purple-50 text-purple-600" />
        <StatCard title="Active Bookings" value={checkedInCount + confirmedCount} subtitle={`${checkedInCount} checked in, ${confirmedCount} confirmed`} icon={Calendar} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Room Status */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Room Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const pct = totalRooms > 0 ? Math.round((count / totalRooms) * 100) : 0;
              const colors: Record<string, string> = {
                AVAILABLE: "bg-teal-400",
                OCCUPIED: "bg-blue-400",
                CLEANING: "bg-orange-400",
                MAINTENANCE: "bg-red-400",
                RESERVED: "bg-purple-400",
              };
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", colors[status] ?? "bg-gray-400")} />
                  <span className="text-xs w-24">{status.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", colors[status] ?? "bg-gray-400")} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right">{count}</span>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Source */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue by Source</h3>
          {revenueByCategory.length > 0 ? (
            <div className="space-y-3">
              {revenueByCategory.map(([cat, amount], i) => {
                const pct = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs w-32 text-muted-foreground truncate">{cat}</span>
                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", barColors[i % barColors.length])} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-24 text-right">{formatCurrency(amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No income records yet</p>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} iconClassName="bg-teal-500/10 text-teal-500" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={Wallet} iconClassName="bg-red-50 text-red-600" />
        <StatCard
          title="Net Profit"
          value={formatCurrency(totalIncome - totalExpenses)}
          icon={BarChart3}
          iconClassName={(totalIncome - totalExpenses) >= 0 ? "bg-teal-500/10 text-teal-500" : "bg-red-50 text-red-600"}
        />
      </div>

      {/* Booking summary cards */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Booking Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: allBookings.length },
            { label: "Checked In", value: checkedInCount },
            { label: "Confirmed", value: confirmedCount },
            { label: "Cancelled", value: allBookings.filter((b) => b.status === "CANCELLED").length },
          ].map((s) => (
            <div key={s.label} className="text-center py-3">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
