"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getGuests } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Search, Loader2 } from "lucide-react";
import type { Guest } from "@/lib/supabase/types";

export default function GuestsPage() {
  const { data: guests, loading } = useSupabaseQuery(() => getGuests(), []);
  const [search, setSearch] = useState("");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allGuests = guests || [];

  const filtered = allGuests.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.full_name.toLowerCase().includes(q) || g.phone.includes(q) || (g.email ?? "").toLowerCase().includes(q);
  });

  const columns: Column<Guest>[] = [
    { header: "Name", accessor: (g) => <span className="font-medium">{g.full_name}</span> },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: (g) => <span className="text-xs">{g.email ?? "—"}</span> },
    { header: "ID Type", accessor: (g) => g.id_type ?? "—" },
    { header: "Nationality", accessor: "nationality" },
    { header: "Joined", accessor: (g) => <span className="text-sm">{formatDate(g.created_at)}</span> },
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
