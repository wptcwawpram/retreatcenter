"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency } from "@/lib/format";
import {
  Loader2, Edit2, Trash2, AlertCircle, Package, AlertTriangle,
  Building2, ChefHat, Warehouse, Church, Home, ShowerHead, Users, Store, Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/supabase/types";

// ─── WPTC Locations ────────────────────────────────────────────────────

const LOCATIONS = [
  { value: "All", label: "All Locations", icon: Package, description: "" },
  { value: "Administration", label: "Administration", icon: Building2, description: "Admin offices, reception, shop" },
  { value: "Faith Block", label: "Faith Block", icon: Church, description: "Rooms 1-12, Suite 1 & 2" },
  { value: "Dominion Block", label: "Dominion Block", icon: Home, description: "Rooms 13-21" },
  { value: "Holy Family", label: "Holy Family", icon: Home, description: "3 rooms, hall, dining (kitchen disabled)" },
  { value: "Dining", label: "Dining", icon: ChefHat, description: "Main kitchen & dining area" },
  { value: "Store", label: "Store", icon: Warehouse, description: "Main store rooms" },
  { value: "Reception Store", label: "Reception Store", icon: Store, description: "Store room in reception" },
  { value: "Public Washroom & Laundry", label: "Washroom & Laundry", icon: ShowerHead, description: "Public washroom and laundry block" },
  { value: "Workers Quarters", label: "Workers Quarters", icon: Users, description: "3 staff rooms and store" },
  { value: "Garage", label: "Garage", icon: Car, description: "Vehicle parking and storage" },
] as const;

const LOCATION_VALUES = LOCATIONS.filter((l) => l.value !== "All").map((l) => l.value);

const CATEGORIES = ["Bedding", "Toiletries", "Cleaning", "Kitchen", "Electronics", "Furniture", "Maintenance", "Office", "Utensils", "Appliances", "Other"];
const UNITS = ["pieces", "rolls", "litres", "kg", "boxes", "packs", "sets", "pairs", "bottles", "gallons"];

export default function InventoryPage() {
  const { data: items, loading, refetch } = useSupabaseQuery(() => getInventoryItems(), []);
  const [activeLocation, setActiveLocation] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allItems = items || [];

  // Filter by location
  const filteredItems = useMemo(() => {
    if (activeLocation === "All") return allItems;
    return allItems.filter((i) => i.location === activeLocation);
  }, [allItems, activeLocation]);

  // Stats per location
  const locationStats = useMemo(() => {
    const stats: Record<string, { total: number; lowStock: number }> = {};
    LOCATION_VALUES.forEach((loc) => {
      const locItems = allItems.filter((i) => i.location === loc);
      stats[loc] = {
        total: locItems.length,
        lowStock: locItems.filter((i) => i.quantity <= i.min_quantity).length,
      };
    });
    return stats;
  }, [allItems]);

  const totalLowStock = allItems.filter((i) => i.quantity <= i.min_quantity).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const itemFields: FormField[] = [
    { name: "name", label: "Item Name", required: true, placeholder: "e.g. Bed Sheets (Double)" },
    { name: "location", label: "Location", type: "select", required: true, options: LOCATION_VALUES.map((l) => ({ label: l, value: l })), defaultValue: activeLocation !== "All" ? activeLocation : "" },
    { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES.map((c) => ({ label: c, value: c })) },
    { name: "quantity", label: "Quantity", type: "number", required: true, min: 0 },
    { name: "min_quantity", label: "Min Stock Level", type: "number", required: true, min: 0 },
    { name: "unit", label: "Unit", type: "select", required: true, options: UNITS.map((u) => ({ label: u, value: u })), defaultValue: "pieces" },
    { name: "cost_per_unit", label: "Cost/Unit (GH₵)", type: "number", min: 0, step: 0.01 },
    { name: "supplier", label: "Supplier", placeholder: "Supplier name" },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createInventoryItem({
      name: values.name as string,
      category: values.category as string,
      location: values.location as string,
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
      location: values.location as string,
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
    try {
      await deleteInventoryItem(deleteItem.id);
      setDeleteItem(null);
      refetch();
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<InventoryItem>[] = [
    { header: "Item", accessor: (i) => (
      <div>
        <span className="font-medium text-sm">{i.name}</span>
        {activeLocation === "All" && (
          <p className="text-[11px] text-muted-foreground">{i.location}</p>
        )}
      </div>
    )},
    { header: "Category", accessor: (i) => (
      <Badge variant="outline" className="text-[11px] font-medium">{i.category}</Badge>
    )},
    { header: "Qty", accessor: (i) => (
      <span className={cn("font-bold text-sm", i.quantity <= i.min_quantity && "text-red-600")}>
        {i.quantity} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span>
      </span>
    ), className: "text-center" },
    { header: "Min", accessor: (i) => (
      <span className="text-sm text-muted-foreground">{i.min_quantity}</span>
    ), className: "text-center" },
    { header: "Cost/Unit", accessor: (i) => (
      <span className="text-sm tabular-nums">{formatCurrency(Number(i.cost_per_unit))}</span>
    )},
    { header: "Status", accessor: (i) => (
      i.quantity <= i.min_quantity ? (
        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 border text-[11px] gap-1">
          <AlertTriangle className="h-3 w-3" /> Low Stock
        </Badge>
      ) : (
        <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 border text-[11px]">In Stock</Badge>
      )
    )},
    { header: "", accessor: (i) => (
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setEditItem(i); }}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(i); }}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Inventory" description="Track supplies across all WPTC blocks and locations" action={{ label: "Add Item", onClick: () => setShowAdd(true) }} />

      {/* Low stock alert */}
      {totalLowStock > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">{totalLowStock} item{totalLowStock > 1 ? "s" : ""}</span> below minimum stock level
          </p>
        </div>
      )}

      {/* Location tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {LOCATIONS.map((loc) => {
          const isActive = activeLocation === loc.value;
          const stat = loc.value !== "All" ? locationStats[loc.value] : null;
          const Icon = loc.icon;
          return (
            <button
              key={loc.value}
              onClick={() => setActiveLocation(loc.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                  : "bg-card text-muted-foreground border-border/60 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {loc.label}
              {loc.value === "All" && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isActive ? "bg-primary/20" : "bg-muted")}>
                  {allItems.length}
                </span>
              )}
              {stat && stat.total > 0 && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isActive ? "bg-primary/20" : "bg-muted")}>
                  {stat.total}
                </span>
              )}
              {stat && stat.lowStock > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">
                  {stat.lowStock}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active location description */}
      {activeLocation !== "All" && (
        <p className="text-xs text-muted-foreground -mt-2">
          {LOCATIONS.find((l) => l.value === activeLocation)?.description}
        </p>
      )}

      <DataTable
        columns={columns}
        data={filteredItems}
        keyExtractor={(i) => i.id}
        total={filteredItems.length}
        emptyMessage={activeLocation === "All" ? "No items in inventory" : `No items in ${activeLocation}`}
      />

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
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
