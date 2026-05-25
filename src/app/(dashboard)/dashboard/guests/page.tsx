"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getGuests, createGuest, updateGuest, deleteGuest } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatDate } from "@/lib/format";
import { Search, Loader2, Edit2, Trash2, AlertCircle, Users, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const allGuests = guests || [];

  const filtered = useMemo(() => {
    if (!search) return allGuests;
    const q = search.toLowerCase();
    return allGuests.filter((g) =>
      g.full_name.toLowerCase().includes(q) || g.phone.includes(q) || (g.email ?? "").toLowerCase().includes(q)
    );
  }, [allGuests, search]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
    { header: "Guest", accessor: (g) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
          {g.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{g.full_name}</p>
          <p className="text-[11px] text-muted-foreground">{g.nationality}</p>
        </div>
      </div>
    )},
    { header: "Contact", accessor: (g) => (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs">
          <Phone className="h-3 w-3 text-muted-foreground" />
          {g.phone}
        </div>
        {g.email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {g.email}
          </div>
        )}
      </div>
    )},
    { header: "ID", accessor: (g) => g.id_type ? (
      <div>
        <Badge variant="outline" className="text-[10px]">{g.id_type}</Badge>
        {g.id_number && <p className="text-[11px] text-muted-foreground mt-0.5">{g.id_number}</p>}
      </div>
    ) : <span className="text-muted-foreground text-xs">—</span>
    },
    { header: "Registered", accessor: (g) => <span className="text-xs text-muted-foreground">{formatDate(g.created_at)}</span> },
    { header: "", accessor: (g) => (
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setEditItem(g); }}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(g); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Guests" description="View and manage guest records" action={{ label: "Add Guest", onClick: () => setShowAdd(true) }} />

      {/* Summary bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span><strong className="text-foreground">{allGuests.length}</strong> total guests</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(g) => g.id} total={filtered.length} emptyMessage="No guests found" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Guest" fields={guestFields} onSubmit={handleAdd} submitLabel="Add Guest" />

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
