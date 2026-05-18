"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { DEMO_COMPLAINTS } from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

type Complaint = (typeof DEMO_COMPLAINTS)[number];

const STATUS_CFG: Record<string, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  RESOLVED: { label: "Resolved", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
};

export default function ComplaintsPage() {
  const columns: Column<Complaint>[] = [
    { header: "Date", accessor: (c) => <span className="text-sm">{formatDate(c.createdAt)}</span> },
    { header: "Guest", accessor: (c) => <span className="font-medium">{c.guestName}</span> },
    { header: "Room", accessor: (c) => <span className="font-mono font-bold">{c.roomNumber}</span> },
    { header: "Category", accessor: (c) => <Badge variant="outline">{COMPLAINT_CATEGORY_LABELS[c.category] ?? c.category}</Badge> },
    { header: "Description", accessor: (c) => <span className="text-sm text-muted-foreground">{c.description}</span> },
    { header: "Assigned To", accessor: (c) => <span className="text-sm">{c.assignedTo ?? "Unassigned"}</span> },
    { header: "Status", accessor: (c) => {
      const cfg = STATUS_CFG[c.status];
      return <Badge className={`${cfg?.bgColor} ${cfg?.color} border`}>{cfg?.label ?? c.status}</Badge>;
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Complaints" description="Track and resolve guest complaints" action={{ label: "Log Complaint" }} />
      <DataTable columns={columns} data={DEMO_COMPLAINTS} keyExtractor={(c) => c.id} total={DEMO_COMPLAINTS.length} emptyMessage="No complaints" />
    </div>
  );
}
