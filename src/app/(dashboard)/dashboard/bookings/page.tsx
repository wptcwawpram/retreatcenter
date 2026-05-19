"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BOOKING_STATUS_CONFIG } from "@/lib/constants";
import { getBookings } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Loader2 } from "lucide-react";
import type { Booking, Guest } from "@/lib/supabase/types";

type BookingWithGuest = Booking & { guest: Guest };

export default function BookingsPage() {
  const { data: bookings, loading } = useSupabaseQuery(() => getBookings(), []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allBookings = (bookings || []) as BookingWithGuest[];

  const filtered = allBookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.reference.toLowerCase().includes(q) || b.guest?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

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
    { header: "Nights", accessor: "nights", className: "text-center" },
    { header: "Total", accessor: (b) => <span className="font-semibold">{formatCurrency(Number(b.total_amount))}</span> },
    { header: "Paid", accessor: (b) => {
      const isPaid = Number(b.paid_amount) >= Number(b.total_amount);
      return <span className={isPaid ? "text-emerald-600" : "text-amber-600"}>{formatCurrency(Number(b.paid_amount))}</span>;
    }},
    { header: "Status", accessor: (b) => <StatusBadge status={b.status} config={BOOKING_STATUS_CONFIG} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Manage all guest bookings and reservations" action={{ label: "New Booking" }} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by reference or guest name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(BOOKING_STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(b) => b.id}
        total={filtered.length}
        emptyMessage="No bookings found"
      />
    </div>
  );
}
