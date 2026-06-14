"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getPayments, getBookings, createPayment, deletePayment } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Wallet, Clock, CreditCard, TrendingUp, Loader2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentRow = {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  notes: string | null;
  created_at: string;
  booking: { reference: string; guest_id: string; guest: { full_name: string } };
};

export default function PaymentsPage() {
  const { data: payments, loading, refetch } = useSupabaseQuery(() => getPayments(), []);
  const { data: bookings } = useSupabaseQuery(() => getBookings(), []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PaymentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allPayments = (payments || []) as PaymentRow[];
  const allBookings = bookings || [];

  const filtered = useMemo(() => allPayments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (methodFilter !== "ALL" && p.method !== methodFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.reference.toLowerCase().includes(q) || p.booking?.guest?.full_name?.toLowerCase().includes(q) || p.booking?.reference?.toLowerCase().includes(q);
    }
    return true;
  }), [allPayments, statusFilter, methodFilter, search]);

  const totalCompleted = useMemo(() => allPayments.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + Number(p.amount), 0), [allPayments]);
  const totalPending = useMemo(() => allPayments.filter((p) => p.status === "PENDING").reduce((s, p) => s + Number(p.amount), 0), [allPayments]);
  const todayTotal = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return allPayments.filter((p) => p.status === "COMPLETED" && p.created_at?.startsWith(today)).reduce((s, p) => s + Number(p.amount), 0);
  }, [allPayments]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const addFields: FormField[] = [
    { name: "booking_id", label: "Booking", type: "select", required: true, colSpan: 2,
      options: allBookings.map((b) => ({ label: `${b.reference} — ${(b as { guest?: { full_name: string } }).guest?.full_name ?? "Unknown"}`, value: b.id }))
    },
    { name: "amount", label: "Amount (GH₵)", type: "number", required: true, min: 0, step: 0.01 },
    { name: "method", label: "Payment Method", type: "select", required: true, options: Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => ({ label: v, value: k })) },
    { name: "status", label: "Status", type: "select", required: true, defaultValue: "COMPLETED", options: Object.entries(PAYMENT_STATUS_CONFIG).map(([k, v]) => ({ label: v.label, value: k })) },
    { name: "notes", label: "Notes", type: "textarea", colSpan: 2, placeholder: "Payment notes" },
  ];

  const handleAdd = async (values: Record<string, unknown>) => {
    await createPayment({
      booking_id: values.booking_id as string,
      amount: Number(values.amount),
      method: values.method as "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER" | "PAYSTACK",
      status: (values.status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED") || "COMPLETED",
      reference: `MAN-${Date.now()}`,
      paystack_reference: null,
      notes: (values.notes as string) || null,
      recorded_by: null,
    });
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try { await deletePayment(deleteItem.id); setDeleteItem(null); refetch(); }
    finally { setDeleting(false); }
  };

  const columns: Column<PaymentRow>[] = [
    { header: "Reference", accessor: (p) => <span className="font-mono text-[11px] font-bold">{p.reference}</span> },
    { header: "Booking", accessor: (p) => (
      <div>
        <span className="font-mono text-[11px]">{p.booking?.reference ?? "—"}</span>
        <p className="text-[11px] text-muted-foreground">{p.booking?.guest?.full_name ?? "—"}</p>
      </div>
    )},
    { header: "Amount", accessor: (p) => <span className="font-semibold text-sm tabular-nums">{formatCurrency(Number(p.amount))}</span> },
    { header: "Method", accessor: (p) => <span className="text-xs">{PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.method}</span> },
    { header: "Status", accessor: (p) => <StatusBadge status={p.status} config={PAYMENT_STATUS_CONFIG} /> },
    { header: "Date", accessor: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span> },
    { header: "", accessor: (p) => (
      <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem(p); }}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Payments" description="Track all payments and transactions" action={{ label: "Record Payment", onClick: () => setShowAdd(true) }} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Collected" value={formatCurrency(totalCompleted)} icon={Wallet} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Pending" value={formatCurrency(totalPending)} icon={Clock} iconClassName="bg-amber-50 text-amber-600" />
        <StatCard title="Transactions" value={allPayments.length} icon={CreditCard} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard title="Today" value={formatCurrency(todayTotal)} icon={TrendingUp} iconClassName="bg-purple-50 text-purple-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} total={filtered.length} emptyMessage="No payments found" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Record Payment" fields={addFields} onSubmit={handleAdd} submitLabel="Record Payment" />

      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Payment</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete payment <strong>{deleteItem?.reference}</strong> for {formatCurrency(Number(deleteItem?.amount))}?</p>
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
