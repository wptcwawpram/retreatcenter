"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { getComplaints, createComplaint, updateComplaint, deleteComplaint, getGuests } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Loader2, Edit2, Trash2, AlertCircle, MessageSquareWarning, Download } from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { cn } from "@/lib/utils";
import type { Complaint } from "@/lib/supabase/types";

type ComplaintRow = Complaint & { guest: { full_name: string } | null };

const STATUS_CFG: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  OPEN: { label: "Open", color: "text-sidebar-primary", bgColor: "bg-sidebar-primary/5 border-sidebar-primary/20", dotColor: "bg-amber-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-500/10 border-blue-500/20", dotColor: "bg-blue-400" },
  RESOLVED: { label: "Resolved", color: "text-teal-400", bgColor: "bg-teal-500/10 border-teal-500/20", dotColor: "bg-teal-400" },
  CLOSED: { label: "Closed", color: "text-gray-700", bgColor: "bg-muted/30 border-border", dotColor: "bg-gray-400" },
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-muted/30 text-muted-foreground border-border",
  NORMAL: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  HIGH: "bg-red-500/10 text-red-700 border-red-500/20",
};

export default function ComplaintsPage() {
  const { data: complaints, loading, refetch } = useSupabaseQuery(() => getComplaints(), []);
  const { data: guests } = useSupabaseQuery(() => getGuests(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<ComplaintRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<ComplaintRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusTab, setStatusTab] = useState("ALL");

  const allComplaints = (complaints || []) as ComplaintRow[];
  const allGuests = guests || [];

  const filtered = useMemo(() => {
    if (statusTab === "ALL") return allComplaints;
    return allComplaints.filter((c) => c.status === statusTab);
  }, [allComplaints, statusTab]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allComplaints.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [allComplaints]);

  const openCount = (statusCounts["OPEN"] || 0) + (statusCounts["IN_PROGRESS"] || 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteComplaint(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const columns: Column<ComplaintRow>[] = [
    { header: "Date", accessor: (c) => <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span> },
    { header: "Guest", accessor: (c) => (
      <div className="flex items-center gap-2">
        {c.guest ? (
          <div className="h-7 w-7 rounded-lg bg-primary/8 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
            {c.guest.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
        ) : null}
        <span className="font-medium text-sm">{c.guest?.full_name ?? "—"}</span>
      </div>
    )},
    { header: "Category", accessor: (c) => <Badge variant="outline" className="text-[10px]">{COMPLAINT_CATEGORY_LABELS[c.category] ?? c.category}</Badge> },
    { header: "Subject", accessor: (c) => <span className="text-sm font-medium">{c.subject}</span> },
    { header: "Priority", accessor: (c) => (
      <Badge className={cn("text-[10px] border", PRIORITY_COLOR[c.priority] ?? "")}>{c.priority}</Badge>
    )},
    { header: "Status", accessor: (c) => {
      const cfg = STATUS_CFG[c.status];
      return (
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", cfg?.dotColor)} />
          <span className={cn("text-xs font-medium", cfg?.color)}>{cfg?.label ?? c.status}</span>
        </div>
      );
    }},
    { header: "", accessor: (c) => (
      <div className="flex gap-0.5">
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setEditItem(c); }}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(c); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Complaints" description="Track and resolve guest complaints" action={{ label: "Log Complaint", onClick: () => setShowAdd(true) }}>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
          downloadCSV("complaints", ["Date", "Guest", "Subject", "Status", "Priority"], filtered.map((c) => [
            formatDate(c.created_at),
            c.guest?.full_name ?? "",
            c.subject,
            STATUS_CFG[c.status]?.label ?? c.status,
            c.priority,
          ]));
        }}>
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </PageHeader>

      {/* Open count alert */}
      {openCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-primary/5 border border-sidebar-primary/20 text-sidebar-primary">
          <MessageSquareWarning className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">{openCount}</span> unresolved complaint{openCount > 1 ? "s" : ""} need attention
          </p>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusTab("ALL")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
            statusTab === "ALL"
              ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
              : "bg-card text-muted-foreground border-border/60 hover:bg-muted/50"
          )}
        >
          All <span className="text-[10px] ml-1 font-bold">{allComplaints.length}</span>
        </button>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusTab(statusTab === key ? "ALL" : key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap",
              statusTab === key
                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                : "bg-card text-muted-foreground border-border/60 hover:bg-muted/50"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
            {cfg.label}
            {(statusCounts[key] || 0) > 0 && <span className="text-[10px] font-bold">{statusCounts[key]}</span>}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(c) => c.id} total={filtered.length} emptyMessage="No complaints" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Log Complaint" fields={addFields} onSubmit={handleAdd} submitLabel="Log Complaint" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Update: ${editItem.subject}`} fields={editFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Complaint</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete complaint <strong>{deleteItem?.subject}</strong>?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
