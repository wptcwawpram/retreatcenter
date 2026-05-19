"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BOOKING_STATUS_CONFIG } from "@/lib/constants";
import { getBookings, createBooking, updateBooking, deleteBooking, getGuests } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Loader2, Eye, Edit2, Trash2, AlertCircle } from "lucide-react";
import type { Booking, Guest } from "@/lib/supabase/types";

type BookingWithGuest = Booking & { guest: Guest };

export default function BookingsPage() {
  const { data: bookings, loading, refetch } = useSupabaseQuery(() => getBookings(), []);
  const { data: guests } = useSupabaseQuery(() => getGuests(), []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<BookingWithGuest | null>(null);
  const [viewItem, setViewItem] = useState<BookingWithGuest | null>(null);
  const [deleteItem, setDeleteItem] = useState<BookingWithGuest | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allBookings = (bookings || []) as BookingWithGuest[];
  const allGuests = guests || [];

  const filtered = allBookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.reference.toLowerCase().includes(q) || b.guest?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const addFields: FormField[] = [
    { name: "guest_id", label: "Guest", type: "select", required: true, options: allGuests.map((g) => ({ label: `${g.full_name} (${g.phone})`, value: g.id })), colSpan: 2 },
    { name: "check_in", label: "Check-in", type: "date", required: true },
    { name: "check_out", label: "Check-out", type: "date", required: true },
    { name: "nights", label: "Nights", type: "number", defaultValue: 1, min: 1 },
    { name: "adults", label: "Adults", type: "number", defaultValue: 1, min: 1 },
    { name: "children", label: "Children", type: "number", defaultValue: 0, min: 0 },
    { name: "total_amount", label: "Total Amount (GH₵)", type: "number", required: true, min: 0, step: 0.01 },
    { name: "booking_type", label: "Type", type: "select", options: [{ label: "Individual", value: "INDIVIDUAL" }, { label: "Group", value: "GROUP" }, { label: "Event", value: "EVENT" }], defaultValue: "INDIVIDUAL" },
    { name: "source", label: "Source", type: "select", options: [{ label: "Walk-In", value: "WALK_IN" }, { label: "Phone", value: "PHONE" }, { label: "Website", value: "WEBSITE" }, { label: "Agent", value: "AGENT" }], defaultValue: "WALK_IN" },
    { name: "special_requests", label: "Special Requests", type: "textarea", colSpan: 2 },
  ];

  const editFields: FormField[] = [
    { name: "status", label: "Status", type: "select", required: true, options: Object.entries(BOOKING_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })) },
    { name: "payment_status", label: "Payment Status", type: "select", options: [{ label: "Unpaid", value: "UNPAID" }, { label: "Partial", value: "PARTIAL" }, { label: "Paid", value: "PAID" }, { label: "Refunded", value: "REFUNDED" }] },
    { name: "check_in", label: "Check-in", type: "date", required: true },
    { name: "check_out", label: "Check-out", type: "date", required: true },
    { name: "nights", label: "Nights", type: "number", min: 1 },
    { name: "total_amount", label: "Total Amount", type: "number", min: 0, step: 0.01 },
    { name: "paid_amount", label: "Paid Amount", type: "number", min: 0, step: 0.01 },
    { name: "special_requests", label: "Special Requests", type: "textarea", colSpan: 2 },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createBooking({
      guest_id: values.guest_id as string,
      room_ids: [],
      check_in: values.check_in as string,
      check_out: values.check_out as string,
      nights: Number(values.nights) || 1,
      adults: Number(values.adults) || 1,
      children: Number(values.children) || 0,
      total_amount: Number(values.total_amount) || 0,
      paid_amount: 0,
      balance: Number(values.total_amount) || 0,
      status: "CONFIRMED",
      booking_type: (values.booking_type as Booking["booking_type"]) || "INDIVIDUAL",
      special_requests: (values.special_requests as string) || null,
      hall_id: null,
      hall_days: 0,
      hall_amount: 0,
      payment_status: "UNPAID",
      source: (values.source as Booking["source"]) || "WALK_IN",
    });
    refetch();
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    await updateBooking(editItem.id, {
      status: values.status as Booking["status"],
      payment_status: values.payment_status as Booking["payment_status"],
      check_in: values.check_in as string,
      check_out: values.check_out as string,
      nights: Number(values.nights),
      total_amount: Number(values.total_amount),
      paid_amount: Number(values.paid_amount),
      special_requests: (values.special_requests as string) || null,
    });
    setEditItem(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteItem.id);
      setDeleteItem(null);
      refetch();
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<BookingWithGuest>[] = [
    { header: "Reference", accessor: (b) => <span className="font-mono text-xs font-bold">{b.reference}</span> },
    { header: "Guest", accessor: (b) => (
      <div>
        <p className="font-medium">{b.guest?.full_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{b.guest?.phone ?? "—"}</p>
      </div>
    )},
    { header: "Check-in", accessor: (b) => <span className="text-sm">{formatDate(b.check_in)}</span> },
    { header: "Check-out", accessor: (b) => <span className="text-sm">{formatDate(b.check_out)}</span> },
    { header: "Total", accessor: (b) => <span className="font-semibold">{formatCurrency(Number(b.total_amount))}</span> },
    { header: "Paid", accessor: (b) => {
      const isPaid = Number(b.paid_amount) >= Number(b.total_amount);
      return <span className={isPaid ? "text-emerald-600" : "text-amber-600"}>{formatCurrency(Number(b.paid_amount))}</span>;
    }},
    { header: "Status", accessor: (b) => <StatusBadge status={b.status} config={BOOKING_STATUS_CONFIG} /> },
    { header: "Actions", accessor: (b) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setViewItem(b); }}><Eye className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditItem(b); }}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setDeleteItem(b); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Manage all guest bookings and reservations" action={{ label: "New Booking", onClick: () => setShowAdd(true) }} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by reference or guest name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(BOOKING_STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(b) => b.id} total={filtered.length} emptyMessage="No bookings found" />

      {/* Add Dialog */}
      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="New Booking" description="Create a new booking from the dashboard" fields={addFields} onSubmit={handleAdd} submitLabel="Create Booking" />

      {/* Edit Dialog */}
      {editItem && (
        <FormDialog
          open={!!editItem}
          onOpenChange={(o) => !o && setEditItem(null)}
          title={`Edit Booking ${editItem.reference}`}
          fields={editFields}
          initialValues={editItem}
          onSubmit={handleEdit}
          isEdit
        />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Booking {viewItem?.reference}</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Guest:</span><p className="font-medium">{viewItem.guest?.full_name}</p></div>
                <div><span className="text-muted-foreground">Phone:</span><p>{viewItem.guest?.phone}</p></div>
                <div><span className="text-muted-foreground">Check-in:</span><p>{formatDate(viewItem.check_in)}</p></div>
                <div><span className="text-muted-foreground">Check-out:</span><p>{formatDate(viewItem.check_out)}</p></div>
                <div><span className="text-muted-foreground">Nights:</span><p>{viewItem.nights}</p></div>
                <div><span className="text-muted-foreground">Type:</span><p>{viewItem.booking_type}</p></div>
                <div><span className="text-muted-foreground">Total:</span><p className="font-bold">{formatCurrency(Number(viewItem.total_amount))}</p></div>
                <div><span className="text-muted-foreground">Paid:</span><p className="font-bold text-emerald-600">{formatCurrency(Number(viewItem.paid_amount))}</p></div>
                <div><span className="text-muted-foreground">Balance:</span><p className="font-bold text-amber-600">{formatCurrency(Number(viewItem.balance))}</p></div>
                <div><span className="text-muted-foreground">Source:</span><p>{viewItem.source}</p></div>
              </div>
              {viewItem.special_requests && (
                <div><span className="text-muted-foreground">Special Requests:</span><p>{viewItem.special_requests}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
            <Button onClick={() => { setEditItem(viewItem); setViewItem(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Booking</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Are you sure you want to delete booking <strong>{deleteItem?.reference}</strong>? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
