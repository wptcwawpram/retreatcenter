"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { getEvents, createEvent, updateEvent, deleteEvent, getVenues } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { Calendar, MapPin, Users, Loader2, Edit2, Trash2, AlertCircle, Download } from "lucide-react";
import { downloadCSV } from "@/lib/export-csv";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/supabase/types";

type EventRow = Event & { venue: { name: string } | null };

const EVENT_STATUS: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  UPCOMING: { label: "Upcoming", color: "text-blue-700", bgColor: "bg-blue-500/10 border-blue-500/20", dotColor: "bg-blue-400" },
  IN_PROGRESS: { label: "In Progress", color: "text-teal-400", bgColor: "bg-teal-500/10 border-teal-500/20", dotColor: "bg-teal-400" },
  COMPLETED: { label: "Completed", color: "text-gray-700", bgColor: "bg-muted/30 border-border", dotColor: "bg-gray-400" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-500/10 border-red-500/20", dotColor: "bg-red-400" },
};

export default function EventsPage() {
  const { data: events, loading, refetch } = useSupabaseQuery(() => getEvents(), []);
  const { data: venues } = useSupabaseQuery(() => getVenues(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<EventRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allEvents = (events || []) as EventRow[];
  const allVenues = venues || [];

  const upcomingCount = useMemo(() => allEvents.filter((e) => e.status === "UPCOMING" || e.status === "IN_PROGRESS").length, [allEvents]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const baseFields: FormField[] = [
    { name: "name", label: "Event Name", required: true, colSpan: 2, placeholder: "e.g. Bethel Church Conference" },
    { name: "organizer", label: "Organizer", required: true, placeholder: "Who is hosting?" },
    { name: "venue_id", label: "Venue", type: "select", options: allVenues.map((v) => ({ label: v.name, value: v.id })) },
    { name: "start_date", label: "Start Date", type: "date", required: true },
    { name: "end_date", label: "End Date", type: "date", required: true },
    { name: "attendees", label: "Expected Attendees", type: "number", required: true, min: 1 },
    { name: "amount", label: "Total Amount (GH₵)", type: "number", required: true, min: 0, step: 0.01 },
    { name: "status", label: "Status", type: "select", required: true, defaultValue: "UPCOMING", options: Object.entries(EVENT_STATUS).map(([k, v]) => ({ label: v.label, value: k })) },
    { name: "notes", label: "Notes", type: "textarea", colSpan: 2, placeholder: "Any additional details" },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createEvent({
      name: values.name as string,
      organizer: values.organizer as string,
      venue_id: (values.venue_id as string) || null,
      start_date: values.start_date as string,
      end_date: values.end_date as string,
      attendees: Number(values.attendees),
      amount: Number(values.amount),
      status: (values.status as Event["status"]) || "UPCOMING",
      notes: (values.notes as string) || null,
    });
    refetch();
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    await updateEvent(editItem.id, {
      name: values.name as string,
      organizer: values.organizer as string,
      venue_id: (values.venue_id as string) || null,
      start_date: values.start_date as string,
      end_date: values.end_date as string,
      attendees: Number(values.attendees),
      amount: Number(values.amount),
      status: values.status as Event["status"],
      notes: (values.notes as string) || null,
    });
    setEditItem(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteEvent(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const columns: Column<EventRow>[] = [
    { header: "Event", accessor: (e) => (
      <div>
        <span className="font-medium text-sm">{e.name}</span>
        <p className="text-[11px] text-muted-foreground">{e.organizer}</p>
      </div>
    )},
    { header: "Venue", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-xs">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        {e.venue?.name ?? "No venue"}
      </div>
    )},
    { header: "Date", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-xs">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        {formatDate(e.start_date)}{e.start_date !== e.end_date ? ` – ${formatDate(e.end_date)}` : ""}
      </div>
    )},
    { header: "Guests", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-xs">
        <Users className="h-3 w-3 text-muted-foreground" />
        {e.attendees}
      </div>
    )},
    { header: "Amount", accessor: (e) => <span className="font-semibold text-sm tabular-nums">{formatCurrency(Number(e.amount))}</span> },
    { header: "Status", accessor: (e) => {
      const cfg = EVENT_STATUS[e.status];
      return (
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", cfg?.dotColor)} />
          <span className={cn("text-xs font-medium", cfg?.color)}>{cfg?.label ?? e.status}</span>
        </div>
      );
    }},
    { header: "", accessor: (e) => (
      <div className="flex gap-0.5">
        <Button variant="ghost" size="icon-xs" onClick={(ev) => { ev.stopPropagation(); setEditItem(e); }}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(ev) => { ev.stopPropagation(); setDeleteItem(e); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Events" description="Manage hall and venue bookings" action={{ label: "New Event", onClick: () => setShowAdd(true) }}>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
          downloadCSV("events", ["Name", "Organizer", "Venue", "Start Date", "End Date", "Attendees", "Amount", "Status"], allEvents.map((e) => [
            e.name, e.organizer, e.venue?.name ?? "", e.start_date, e.end_date, e.attendees, Number(e.amount), e.status,
          ]));
        }}>
          <Download className="h-3.5 w-3.5" />Export CSV
        </Button>
      </PageHeader>

      {/* Venue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {allVenues.length > 0 ? allVenues.map((v) => (
          <div key={v.id} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all">
            <h4 className="font-semibold text-sm mb-1.5">{v.name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" /> Capacity: {v.capacity}
            </div>
            <p className="text-sm font-semibold text-primary">{formatCurrency(v.price_per_day)}/day</p>
          </div>
        )) : (
          <>
            {[
              { name: "Faith Hall 1", capacity: "200+", prices: "GH₵400 – GH₵550/day" },
              { name: "Pavilion", capacity: "300+", prices: "GH₵700 – GH₵900/day" },
              { name: "Kitchen & Dining", capacity: "55+", prices: "GH₵250 – GH₵500/day" },
            ].map((v) => (
              <div key={v.name} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all">
                <h4 className="font-semibold text-sm mb-1.5">{v.name}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Users className="h-3.5 w-3.5" /> {v.capacity}
                </div>
                <p className="text-sm font-semibold text-primary">{v.prices}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Event count info */}
      {upcomingCount > 0 && (
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{upcomingCount}</strong> upcoming/active event{upcomingCount > 1 ? "s" : ""}
        </p>
      )}

      <DataTable columns={columns} data={allEvents} keyExtractor={(e) => e.id} total={allEvents.length} emptyMessage="No events yet. Click 'New Event' to create one." />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="New Event" fields={baseFields} onSubmit={handleAdd} submitLabel="Create Event" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit: ${editItem.name}`} fields={baseFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Event</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete event <strong>{deleteItem?.name}</strong>?</p>
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
