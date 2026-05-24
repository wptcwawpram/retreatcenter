"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getPayments, getBookings, createPayment, deletePayment } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Wallet, Clock, CreditCard, TrendingUp, Loader2, Trash2 } from "lucide-react";
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
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    setDeleting(id);
    try {
      await deletePayment(id);
      refetch();
    } catch {
      alert("Failed to delete payment.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allPayments = (payments || []) as PaymentRow[];
  const allBookings = bookings || [];

  const filtered = allPayments.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (methodFilter !== "ALL" && p.method !== methodFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.reference.toLowerCase().includes(q) || p.booking?.guest?.full_name?.toLowerCase().includes(q) || p.booking?.reference?.toLowerCase().includes(q);
    }
    return true;
  });

  const totalCompleted = allPayments.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = allPayments.filter((p) => p.status === "PENDING").reduce((s, p) => s + Number(p.amount), 0);

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

  const columns: Column<PaymentRow>[] = [
    { header: "Reference", accessor: (p) => <span className="font-mono text-xs font-bold">{p.reference}</span> },
    { header: "Booking", accessor: (p) => <span className="font-mono text-xs">{p.booking?.reference ?? "—"}</span> },
    { header: "Guest", accessor: (p) => <span className="font-medium">{p.booking?.guest?.full_name ?? "—"}</span> },
    { header: "Amount", accessor: (p) => <span className="font-semibold">{formatCurrency(Number(p.amount))}</span> },
    { header: "Method", accessor: (p) => <span className="text-xs">{PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.method}</span> },
    { header: "Status", accessor: (p) => <StatusBadge status={p.status} config={PAYMENT_STATUS_CONFIG} /> },
    { header: "Date", accessor: (p) => <span className="text-sm">{formatDate(p.created_at)}</span> },
    { header: "Note", accessor: (p) => <span className="text-xs text-muted-foreground">{p.notes ?? ""}</span> },
    { header: "", accessor: (p) => (
      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleDeletePayment(p.id); }} disabled={deleting === p.id}>
        {deleting === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 text-red-500" />}
      </Button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track all payments and transactions" action={{ label: "Record Payment", onClick: () => setShowAdd(true) }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collected" value={formatCurrency(totalCompleted)} icon={Wallet} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Pending" value={formatCurrency(totalPending)} icon={Clock} iconClassName="bg-amber-50 text-amber-600" />
        <StatCard title="Transactions" value={allPayments.length} icon={CreditCard} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard title="Today" value={formatCurrency(allPayments.filter((p) => p.status === "COMPLETED" && p.created_at?.startsWith(new Date().toISOString().split("T")[0])).reduce((s, p) => s + Number(p.amount), 0))} icon={TrendingUp} iconClassName="bg-purple-50 text-purple-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, cfg]) => (<SelectItem key={key} value={key}>{cfg.label}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} total={filtered.length} emptyMessage="No payments found" />

      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Record Payment" description="Manually record a payment" fields={addFields} onSubmit={handleAdd} submitLabel="Record Payment" />
    </div>
  );
}
