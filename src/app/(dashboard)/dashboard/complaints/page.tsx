"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { getComplaints } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Loader2 } from "lucide-react";
import type { Complaint } from "@/lib/supabase/types";

type ComplaintRow = Complaint & { guest: { full_name: string } | null };

const STATUS_CFG: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: "Open", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  RESOLVED: { label: "Resolved", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  CLOSED: { label: "Closed", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200" },
};

export default function ComplaintsPage() {
  const { data: complaints, loading } = useSupabaseQuery(() => getComplaints(), []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allComplaints = (complaints || []) as ComplaintRow[];

  const columns: Column<ComplaintRow>[] = [
    { header: "Date", accessor: (c) => <span className="text-sm">{formatDate(c.created_at)}</span> },
    { header: "Guest", accessor: (c) => <span className="font-medium">{c.guest?.full_name ?? "—"}</span> },
    { header: "Category", accessor: (c) => <Badge variant="outline">{COMPLAINT_CATEGORY_LABELS[c.category] ?? c.category}</Badge> },
    { header: "Subject", accessor: (c) => <span className="text-sm font-medium">{c.subject}</span> },
    { header: "Description", accessor: (c) => <span className="text-sm text-muted-foreground">{c.description}</span> },
    { header: "Status", accessor: (c) => {
      const cfg = STATUS_CFG[c.status];
      return <Badge className={`${cfg?.bgColor} ${cfg?.color} border`}>{cfg?.label ?? c.status}</Badge>;
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Complaints" description="Track and resolve guest complaints" action={{ label: "Log Complaint" }} />
      <DataTable columns={columns} data={allComplaints} keyExtractor={(c) => c.id} total={allComplaints.length} emptyMessage="No complaints" />
    </div>
  );
}
