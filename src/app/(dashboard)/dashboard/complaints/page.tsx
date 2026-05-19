"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { getComplaints, createComplaint, updateComplaint, getGuests } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Loader2, Edit2 } from "lucide-react";
import type { Complaint } from "@/lib/supabase/types";

type ComplaintRow = Complaint & { guest: { full_name: string } | null };

const STATUS_CFG: Record<string, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: "Open", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  RESOLVED: { label: "Resolved", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  CLOSED: { label: "Closed", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200" },
};

export default function ComplaintsPage() {
  const { data: complaints, loading, refetch } = useSupabaseQuery(() => getComplaints(), []);
  const { data: guests } = useSupabaseQuery(() => getGuests(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<ComplaintRow | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allComplaints = (complaints || []) as ComplaintRow[];
  const allGuests = guests || [];

  const addFields: FormField[] = [
    { name: "guest_id", label: "Guest", type: "select", options: allGuests.map((g) => ({ label: `${g.full_name} (${g.phone})`, value: g.id })), colSpan: 2 },
    { name: "category", label: "Category", type: "select", required: true, options: Object.entries(COMPLAINT_CATEGORY_LABELS).map(([k, v]) => ({ label: v, value: k })) },
    { name: "priority", label: "Priority", type: "select", required: true, defaultValue: "NORMAL", options: [{ label: "Low", value: "LOW" }, { label: "Normal", value: "NORMAL" }, { label: "High", value: "HIGH" }] },
    { name: "subject", label: "Subject", required: true, colSpan: 2, placeholder: "Brief subject" },
    { name: "description", label: "Description", type: "textarea", required: true, colSpan: 2, placeholder: "Describe the complaint" },
  ];

  const editFields: FormField[] = [
    { name: "status", label: "Status", type: "select", required: true, options: Object.entries(STATUS_CFG).map(([k, v]) => ({ label: v.label, value: k })) },
    { name: "priority", label: "Priority", type: "select", options: [{ label: "Low", value: "LOW" }, { label: "Normal", value: "NORMAL" }, { label: "High", value: "HIGH" }] },
    { name: "resolution", label: "Resolution Notes", type: "textarea", colSpan: 2, placeholder: "How was this resolved?" },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createComplaint({
      guest_id: (values.guest_id as string) || null,
      booking_id: null,
      room_id: null,
      category: values.category as Complaint["category"],
      subject: values.subject as string,
      description: values.description as string,
      status: "OPEN",
      priority: (values.priority as Complaint["priority"]) || "NORMAL",
      resolved_by: null,
      resolution: null,
    });
    refetch();
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    const updates: Partial<Complaint> = {
      status: values.status as Complaint["status"],
      priority: values.priority as Complaint["priority"],
      resolution: (values.resolution as string) || null,
    };
    if (values.status === "RESOLVED" || values.status === "CLOSED") {
      updates.resolved_at = new Date().toISOString();
    }
    await updateComplaint(editItem.id, updates);
    setEditItem(null);
    refetch();
  };

  const columns: Column<ComplaintRow>[] = [
    { header: "Date", accessor: (c) => <span className="text-sm">{formatDate(c.created_at)}</span> },
    { header: "Guest", accessor: (c) => <span className="font-medium">{c.guest?.full_name ?? "—"}</span> },
    { header: "Category", accessor: (c) => <Badge variant="outline">{COMPLAINT_CATEGORY_LABELS[c.category] ?? c.category}</Badge> },
    { header: "Subject", accessor: (c) => <span className="text-sm font-medium">{c.subject}</span> },
    { header: "Priority", accessor: (c) => {
      const colors: Record<string, string> = { LOW: "bg-gray-50 text-gray-700 border-gray-200", NORMAL: "bg-blue-50 text-blue-700 border-blue-200", HIGH: "bg-red-50 text-red-700 border-red-200" };
      return <Badge className={`${colors[c.priority] || ""} border`}>{c.priority}</Badge>;
    }},
    { header: "Status", accessor: (c) => {
      const cfg = STATUS_CFG[c.status];
      return <Badge className={`${cfg?.bgColor} ${cfg?.color} border`}>{cfg?.label ?? c.status}</Badge>;
    }},
    { header: "", accessor: (c) => (
      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditItem(c); }}><Edit2 className="h-3.5 w-3.5" /></Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Complaints" description="Track and resolve guest complaints" action={{ label: "Log Complaint", onClick: () => setShowAdd(true) }} />
      <DataTable columns={columns} data={allComplaints} keyExtractor={(c) => c.id} total={allComplaints.length} emptyMessage="No complaints" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Log Complaint" description="Record a new guest complaint" fields={addFields} onSubmit={handleAdd} submitLabel="Log Complaint" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Update: ${editItem.subject}`} fields={editFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}
    </div>
  );
}
