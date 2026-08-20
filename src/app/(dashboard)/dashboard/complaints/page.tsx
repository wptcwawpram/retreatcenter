"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog"; // used for add dialog only
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { COMPLAINT_CATEGORY_LABELS } from "@/lib/constants";
import { getComplaints, createComplaint, updateComplaint, deleteComplaint, getGuests } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit2, Trash2, AlertCircle, MessageSquareWarning, Download, Send, CheckCircle } from "lucide-react";
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
  const [notifyItem, setNotifyItem] = useState<ComplaintRow | null>(null);
  const [guestMessage, setGuestMessage] = useState("");
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [updateSent, setUpdateSent] = useState(false);
  const [editNotify, setEditNotify] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editResolution, setEditResolution] = useState("");

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


  const handleAdd = async (values: Record<string, unknown>) => {
    const newComplaint = await createComplaint({
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
    // Notify guest via SMS that their complaint was received
    if (newComplaint?.id && values.guest_id) {
      fetch("/api/complaints/notify-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: newComplaint.id, type: "received" }),
      }).catch(() => {});
    }
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
    // Optionally notify guest via SMS
    if (editNotify && editMessage.trim() && editItem.guest_id) {
      fetch("/api/complaints/notify-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: editItem.id, message: editMessage.trim() }),
      }).catch(() => {});
    }
    setEditItem(null);
    setEditNotify(false);
    setEditMessage("");
    refetch();
  };

  const handleSendGuestUpdate = async () => {
    if (!notifyItem || !guestMessage.trim()) return;
    setSendingUpdate(true);
    try {
      const res = await fetch("/api/complaints/notify-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: notifyItem.id, message: guestMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setUpdateSent(true);
      setGuestMessage("");
      setTimeout(() => setUpdateSent(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send update to guest");
    } finally {
      setSendingUpdate(false);
    }
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
    { header: "Subject / Description", accessor: (c) => (
      <div className="max-w-xs">
        <p className="text-sm font-medium truncate">{c.subject}</p>
        {c.description && <p className="text-[11px] text-muted-foreground truncate mt-0.5" title={c.description}>{c.description}</p>}
      </div>
    )},
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
        {c.guest_id && (
          <Button variant="ghost" size="icon-xs" className="text-primary" title="Send update to guest" onClick={(e) => { e.stopPropagation(); setNotifyItem(c); setGuestMessage(""); setUpdateSent(false); }}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setEditItem(c); setEditStatus(c.status); setEditPriority(c.priority); setEditResolution(c.resolution || ""); setEditNotify(false); setEditMessage(""); }}><Edit2 className="h-3.5 w-3.5" /></Button>
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

      {/* Edit complaint dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) { setEditItem(null); setEditNotify(false); setEditMessage(""); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Update: {editItem.subject}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status *</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Priority</Label>
                  <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Resolution Notes</Label>
                <Textarea value={editResolution} onChange={(e) => setEditResolution(e.target.value)} placeholder="How was this resolved?" rows={3} className="resize-none" />
              </div>
              {/* Optional SMS notify */}
              {editItem.guest_id && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="accent-primary h-4 w-4 rounded" checked={editNotify} onChange={(e) => setEditNotify(e.target.checked)} />
                    <span className="text-sm font-medium">Notify guest via SMS</span>
                  </label>
                  {editNotify && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Message to send</Label>
                      <Textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} placeholder="e.g. We have reviewed your complaint and resolved it. Thank you for your patience." rows={2} className="resize-none text-sm" />
                      <p className="text-[10px] text-muted-foreground">Sent as SMS to guest&apos;s phone number.</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditItem(null); setEditNotify(false); setEditMessage(""); }}>Cancel</Button>
                <Button onClick={() => handleEdit({ status: editStatus, priority: editPriority, resolution: editResolution })}>Save Changes</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Send Update to Guest */}
      <Dialog open={!!notifyItem} onOpenChange={(o) => !o && setNotifyItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Update to Guest</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/30 border border-border/60 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Complaint</p>
              <p className="text-sm font-medium">{notifyItem?.subject}</p>
              <p className="text-xs text-muted-foreground">Guest: {notifyItem?.guest?.full_name ?? "Unknown"}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message to guest (SMS)</Label>
              <Textarea
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                placeholder="e.g. We are looking into your concern and will have it resolved shortly."
                rows={3}
                className="resize-none"
              />
              <p className="text-[10px] text-muted-foreground">This will be sent as an SMS to the guest&apos;s phone number.</p>
            </div>
            {updateSent && (
              <div className="flex items-center gap-2 text-sm text-teal-500">
                <CheckCircle className="h-4 w-4" />Update sent to guest
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyItem(null)} disabled={sendingUpdate}>Cancel</Button>
            <Button onClick={handleSendGuestUpdate} disabled={sendingUpdate || !guestMessage.trim()} className="gap-1.5">
              {sendingUpdate ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-3.5 w-3.5" />Send Update</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
