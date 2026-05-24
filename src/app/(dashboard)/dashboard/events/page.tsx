"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { getEvents, createEvent, updateEvent, deleteEvent, getVenues } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { Calendar, MapPin, Users, Loader2, Edit2, Trash2 } from "lucide-react";
import type { Event } from "@/lib/supabase/types";

type EventRow = Event & { venue: { name: string } | null };

const EVENT_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  UPCOMING: { label: "Upcoming", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  IN_PROGRESS: { label: "In Progress", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  COMPLETED: { label: "Completed", color: "text-gray-700", bgColor: "bg-gray-50 border-gray-200" },
  CANCELLED: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
};

export default function EventsPage() {
  const { data: events, loading, refetch } = useSupabaseQuery(() => getEvents(), []);
  const { data: venues } = useSupabaseQuery(() => getVenues(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<EventRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allEvents = (events || []) as EventRow[];
  const allVenues = venues || [];

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
      refetch();
    } catch {
      alert("Failed to delete event.");
    } finally {
      setDeleting(null);
    }
  };

  const columns: Column<EventRow>[] = [
    { header: "Event", accessor: (e) => (
      <div>
        <span className="font-medium">{e.name}</span>
        <p className="text-xs text-muted-foreground">{e.organizer}</p>
      </div>
    )},
    { header: "Venue", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-sm">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        {e.venue?.name ?? "No venue"}
      </div>
    )},
    { header: "Date", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        {formatDate(e.start_date)}{e.start_date !== e.end_date ? ` – ${formatDate(e.end_date)}` : ""}
      </div>
    )},
    { header: "Attendees", accessor: (e) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        {e.attendees}
      </div>
    )},
    { header: "Amount", accessor: (e) => <span className="font-semibold">{formatCurrency(Number(e.amount))}</span> },
    { header: "Status", accessor: (e) => {
      const cfg = EVENT_STATUS[e.status];
      return <Badge className={`${cfg?.bgColor} ${cfg?.color} border`}>{cfg?.label ?? e.status}</Badge>;
    }},
    { header: "", accessor: (e) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(ev) => { ev.stopPropagation(); setEditItem(e); }}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }} disabled={deleting === e.id}>
          {deleting === e.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-red-500" />}
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description="Manage hall and venue bookings" action={{ label: "New Event", onClick: () => setShowAdd(true) }} />

      {/* Venue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allVenues.length > 0 ? allVenues.map((v) => (
          <Card key={v.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-1">{v.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" /> Capacity: {v.capacity}
              </div>
              <p className="text-sm font-medium text-primary">{formatCurrency(v.price_per_day)}/day</p>
            </CardContent>
          </Card>
        )) : (
          <>
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
          </>
        )}
      </div>

      <DataTable columns={columns} data={allEvents} keyExtractor={(e) => e.id} total={allEvents.length} emptyMessage="No events yet. Click 'New Event' to create one." />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="New Event" description="Create a new event or venue booking" fields={baseFields} onSubmit={handleAdd} submitLabel="Create Event" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit: ${editItem.name}`} fields={baseFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}
    </div>
  );
}
