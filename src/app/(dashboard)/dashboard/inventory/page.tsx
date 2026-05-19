"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency } from "@/lib/format";
import { Loader2, Edit2, Trash2, AlertCircle } from "lucide-react";
import type { InventoryItem } from "@/lib/supabase/types";

const CATEGORIES = ["Bedding", "Toiletries", "Cleaning", "Kitchen", "Electronics", "Furniture", "Maintenance", "Office", "Other"];
const UNITS = ["pieces", "rolls", "litres", "kg", "boxes", "packs", "sets"];

const itemFields: FormField[] = [
  { name: "name", label: "Item Name", required: true, placeholder: "e.g. Bed Sheets (Double)" },
  { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES.map((c) => ({ label: c, value: c })) },
  { name: "quantity", label: "Quantity", type: "number", required: true, min: 0 },
  { name: "min_quantity", label: "Min Stock Level", type: "number", required: true, min: 0 },
  { name: "unit", label: "Unit", type: "select", required: true, options: UNITS.map((u) => ({ label: u, value: u })), defaultValue: "pieces" },
  { name: "cost_per_unit", label: "Cost/Unit (GH₵)", type: "number", min: 0, step: 0.01 },
  { name: "supplier", label: "Supplier", placeholder: "Supplier name" },
];

export default function InventoryPage() {
  const { data: items, loading, refetch } = useSupabaseQuery(() => getInventoryItems(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allItems = items || [];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createInventoryItem({
      name: values.name as string,
      category: values.category as string,
      quantity: Number(values.quantity),
      min_quantity: Number(values.min_quantity),
      unit: values.unit as string,
      cost_per_unit: Number(values.cost_per_unit) || 0,
      supplier: (values.supplier as string) || null,
      last_restocked: null,
    });
    refetch();
  };

  const handleEdit = async (values: Record<string, unknown>) => {
    if (!editItem) return;
    await updateInventoryItem(editItem.id, {
      name: values.name as string,
      category: values.category as string,
      quantity: Number(values.quantity),
      min_quantity: Number(values.min_quantity),
      unit: values.unit as string,
      cost_per_unit: Number(values.cost_per_unit) || 0,
      supplier: (values.supplier as string) || null,
      last_restocked: new Date().toISOString().split("T")[0],
    });
    setEditItem(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteInventoryItem(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const columns: Column<InventoryItem>[] = [
    { header: "Item", accessor: (i) => <span className="font-medium">{i.name}</span> },
    { header: "Category", accessor: (i) => <Badge variant="outline">{i.category}</Badge> },
    { header: "Qty", accessor: (i) => <span className="font-bold">{i.quantity} {i.unit}</span>, className: "text-center" },
    { header: "Min", accessor: (i) => <span className="text-muted-foreground">{i.min_quantity}</span>, className: "text-center" },
    { header: "Cost/Unit", accessor: (i) => <span className="text-sm">{formatCurrency(Number(i.cost_per_unit))}</span> },
    { header: "Status", accessor: (i) => (
      <Badge className={i.quantity > i.min_quantity ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
        {i.quantity <= i.min_quantity ? "Low Stock" : "In Stock"}
      </Badge>
    )},
    { header: "Actions", accessor: (i) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditItem(i); }}><Edit2 className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(i); }}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Track room inventory and supplies" action={{ label: "Add Item", onClick: () => setShowAdd(true) }} />
      <DataTable columns={columns} data={allItems} keyExtractor={(i) => i.id} total={allItems.length} emptyMessage="No items in inventory" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Inventory Item" fields={itemFields} onSubmit={handleAdd} submitLabel="Add Item" />
      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title={`Edit ${editItem.name}`} fields={itemFields} initialValues={editItem} onSubmit={handleEdit} isEdit />
      )}

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Item</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete <strong>{deleteItem?.name}</strong> from inventory?</p>
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
