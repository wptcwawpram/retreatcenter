"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getFinanceRecords, createFinanceRecord, deleteFinanceRecord } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Loader2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FinanceRecord } from "@/lib/supabase/types";

const INCOME_CATEGORIES = ["Room Booking", "Hall Rental", "Event Hosting", "Dining", "Other Income"];
const EXPENSE_CATEGORIES = ["Salaries", "Utilities", "Maintenance", "Supplies", "Equipment", "Food & Catering", "Marketing", "Transport", "Other Expense"];

export default function FinancePage() {
  const { data: finance, loading, refetch } = useSupabaseQuery(() => getFinanceRecords(), []);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<FinanceRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allRecords = finance || [];

  const filtered = useMemo(() =>
    allRecords.filter((f) => typeFilter === "ALL" || f.type === typeFilter),
    [allRecords, typeFilter]
  );

  const totalIncome = useMemo(() => allRecords.filter((f) => f.type === "INCOME").reduce((s, f) => s + Number(f.amount), 0), [allRecords]);
  const totalExpenses = useMemo(() => allRecords.filter((f) => f.type === "EXPENSE").reduce((s, f) => s + Number(f.amount), 0), [allRecords]);
  const netIncome = totalIncome - totalExpenses;

  const incomeBreakdown = useMemo(() => {
    return Object.entries(
      allRecords.filter((f) => f.type === "INCOME").reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + Number(f.amount);
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]);
  }, [allRecords]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const addFields: FormField[] = [
    { name: "type", label: "Type", type: "select", required: true, options: [{ label: "Income", value: "INCOME" }, { label: "Expense", value: "EXPENSE" }] },
    { name: "category", label: "Category", type: "select", required: true, options: [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => ({ label: c, value: c })) },
    { name: "amount", label: "Amount (GH₵)", type: "number", required: true, min: 0, step: 0.01 },
    { name: "date", label: "Date", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
    { name: "description", label: "Description", type: "textarea", required: true, colSpan: 2, placeholder: "Describe the transaction" },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createFinanceRecord({
      type: values.type as "INCOME" | "EXPENSE",
      category: values.category as string,
      amount: Number(values.amount),
      date: values.date as string,
      description: values.description as string,
      recorded_by: null,
      booking_id: null,
    });
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deleteFinanceRecord(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const columns: Column<FinanceRecord>[] = [
    { header: "Date", accessor: (f) => <span className="text-xs text-muted-foreground">{formatDate(f.date)}</span> },
    { header: "Type", accessor: (f) => (
      <Badge className={cn(
        "text-[10px] border gap-0.5",
        f.type === "INCOME" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
      )}>
        {f.type === "INCOME" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {f.type}
      </Badge>
    )},
    { header: "Category", accessor: (f) => <span className="font-medium text-sm">{f.category}</span> },
    { header: "Description", accessor: (f) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] block">{f.description}</span> },
    { header: "Amount", accessor: (f) => (
      <span className={cn("font-semibold text-sm tabular-nums", f.type === "INCOME" ? "text-emerald-600" : "text-red-600")}>
        {f.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(f.amount))}
      </span>
    )},
    { header: "", accessor: (f) => (
      <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(f); }}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Finance" description="Income, expenses, and financial overview" action={{ label: "Add Record", onClick: () => setShowAdd(true) }} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconClassName="bg-red-50 text-red-600" />
        <StatCard title="Net Income" value={formatCurrency(netIncome)} icon={DollarSign} iconClassName={netIncome >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"} />
      </div>

      {/* Income breakdown */}
      {incomeBreakdown.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Income Breakdown</h3>
          <div className="space-y-2.5">
            {incomeBreakdown.map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs w-32 text-muted-foreground truncate">{cat}</span>
                <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${totalIncome > 0 ? (amount / totalIncome) * 100 : 0}%` }} />
                </div>
                <span className="text-xs font-semibold tabular-nums w-24 text-right">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + table */}
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Records</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(f) => f.id} total={filtered.length} emptyMessage="No records found" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Finance Record" fields={addFields} onSubmit={handleAdd} submitLabel="Add Record" />

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Record</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete this {deleteItem?.type.toLowerCase()} record for <strong>{formatCurrency(Number(deleteItem?.amount))}</strong>?</p>
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
