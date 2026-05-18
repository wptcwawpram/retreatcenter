"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DEMO_GUESTS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";
import { Search } from "lucide-react";

type Guest = (typeof DEMO_GUESTS)[number];

export default function GuestsPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_GUESTS.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) || g.phone.includes(q) || g.email.toLowerCase().includes(q);
  });

  const columns: Column<Guest>[] = [
    { header: "Name", accessor: (g) => <span className="font-medium">{g.firstName} {g.lastName}</span> },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: (g) => <span className="text-xs">{g.email}</span> },
    { header: "ID Type", accessor: "idType" },
    { header: "Nationality", accessor: "nationality" },
    { header: "Bookings", accessor: (g) => <Badge variant="secondary">{g.totalBookings}</Badge>, className: "text-center" },
    { header: "Last Visit", accessor: (g) => <span className="text-sm">{formatDate(g.lastVisit)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Guest Management" description="View and manage guest records" action={{ label: "Add Guest" }} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(g) => g.id} total={filtered.length} emptyMessage="No guests found" />
    </div>
  );
}
