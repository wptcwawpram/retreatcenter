"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getGuests, createGuest, updateGuest, deleteGuest } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Search, Loader2, Edit2, Trash2, AlertCircle } from "lucide-react";
import type { Guest } from "@/lib/supabase/types";

const guestFields: FormField[] = [
  { name: "full_name", label: "Full Name", required: true, placeholder: "Full name" },
  { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "+233 XXX XXX XXX" },
  { name: "email", label: "Email", type: "email", placeholder: "email@example.com" },
  { name: "nationality", label: "Nationality", defaultValue: "Ghanaian" },
  { name: "id_type", label: "ID Type", type: "select", options: [{ label: "Ghana Card", value: "Ghana Card" }, { label: "Passport", value: "Passport" }, { label: "Driver's License", value: "Driver's License" }] },
  { name: "id_number", label: "ID Number", placeholder: "ID number" },
  { name: "address", label: "Address", colSpan: 2, placeholder: "Address" },
  { name: "notes", label: "Notes", type: "textarea", colSpan: 2, placeholder: "Any notes about the guest" },
];

export default function GuestsPage() {
  const { data: guests, loading, refetch } = useSupabaseQuery(() => getGuests(), []);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Guest | null>(null);
  const [deleteItem, setDeleteItem] = useState<Guest | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allGuests = guests || [];
  const filtered = allGuests.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.full_name.toLowerCase().includes(q) || g.phone.includes(q) || (g.email ?? "").toLowerCase().includes(q);
  });

  const handleAdd = async (values: Record<string, unknown>) => {
    await createGuest({
      full_name: values.full_name as string,
      phone: values.phone as string,
      email: (values.email as string) || null,
      nationality: (values.nationality as string) || "Ghanaian",
      id_type: (values.id_type as string) || null,
      id_number: (values.id_number as string) || null,
      address: (values.address as string) || null,
      notes: (values.notes as string) || null,
    });
    refetch();
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    await updateGuest(editItem.id, {
      full_name: values.full_name as string,
      phone: values.phone as string,
      email: (values.email as string) || null,
      nationality: (values.nationality as string) || "Ghanaian",
      id_type: (values.id_type as string) || null,
      id_number: (values.id_number as string) || null,
      address: (values.address as string) || null,
      notes: (values.notes as string) || null,
    });
    setEditItem(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteGuest(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const columns: Column<Guest>[] = [
    { header: "Name", accessor: (g) => <span className="font-medium">{g.full_name}</span> },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: (g) => <span className="text-xs">{g.email ?? "—"}</span> },
    { header: "ID Type", accessor: (g) => g.id_type ?? "—" },
    { header: "Nationality", accessor: "nationality" },
    { header: "Joined", accessor: (g) => <span className="text-sm">{formatDate(g.created_at)}</span> },
    { header: "Actions", accessor: (g) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditItem(g); }}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(g); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Guest Management" description="View and manage guest records" action={{ label: "Add Guest", onClick: () => setShowAdd(true) }} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search guests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(g) => g.id} total={filtered.length} emptyMessage="No guests found" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Guest" description="Add a new guest record" fields={guestFields} onSubmit={handleAdd} submitLabel="Add Guest" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit ${editItem.full_name}`} fields={guestFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Guest</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete <strong>{deleteItem?.full_name}</strong>? This will also remove their booking history.</p>
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
