"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { formatCurrency, formatDate } from "@/lib/format";
import { Calendar, MapPin, Users } from "lucide-react";

const DEMO_EVENTS = [
  { id: "ev1", name: "Bethel Church Conference", venue: "Faith Hall 1", date: "2026-05-20", endDate: "2026-05-23", attendees: 120, amount: 1650, status: "CONFIRMED" },
  { id: "ev2", name: "Asante Family Wedding", venue: "Pavilion (with canopy)", date: "2026-06-14", endDate: "2026-06-14", attendees: 250, amount: 4900, status: "CONFIRMED" },
  { id: "ev3", name: "Youth Bible Study Retreat", venue: "Faith Hall 1 (AC)", date: "2026-05-25", endDate: "2026-05-27", attendees: 60, amount: 1100, status: "PENDING" },
  { id: "ev4", name: "Women's Prayer Conference", venue: "Pavilion (no canopy)", date: "2026-06-07", endDate: "2026-06-08", attendees: 180, amount: 1400, status: "CONFIRMED" },
  { id: "ev5", name: "Pastors' Fellowship Lunch", venue: "Kitchen & Dining Hall", date: "2026-05-30", endDate: "2026-05-30", attendees: 45, amount: 400, status: "PENDING" },
];

type Event = (typeof DEMO_EVENTS)[number];

const EVENT_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  CONFIRMED: { label: "Confirmed", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  PENDING: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
};

export default function EventsPage() {
  const columns: Column<Event>[] = [
    { header: "Event", accessor: (e) => <span className="font-medium">{e.name}</span> },
    { header: "Venue", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-sm">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        {e.venue}
      </div>
    )},
    { header: "Date", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        {formatDate(e.date)}{e.date !== e.endDate ? ` – ${formatDate(e.endDate)}` : ""}
      </div>
    )},
    { header: "Attendees", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        {e.attendees}
      </div>
    )},
    { header: "Amount", accessor: (e) => <span className="font-semibold">{formatCurrency(e.amount)}</span> },
    { header: "Status", accessor: (e) => {
      const cfg = EVENT_STATUS[e.status];
      return <Badge className={`${cfg?.bgColor} ${cfg?.color} border`}>{cfg?.label}</Badge>;
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Manage hall and venue bookings" action={{ label: "New Event" }} />

      {/* Venue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Faith Hall 1", capacity: "200+", prices: "GH₵400 – GH₵550/day" },
          { name: "Pavilion", capacity: "300+", prices: "GH₵700 – GH₵900/day" },
          { name: "Kitchen & Dining", capacity: "55+", prices: "GH₵250 – GH₵500/day" },
        ].map((v) => (
          <Card key={v.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-1">{v.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" /> {v.capacity}
              </div>
              <p className="text-sm font-medium text-primary">{v.prices}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable columns={columns} data={DEMO_EVENTS} keyExtractor={(e) => e.id} total={DEMO_EVENTS.length} emptyMessage="No events" />
    </div>
  );
}
