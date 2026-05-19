"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAYMENT_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getPayments } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, Wallet, Clock, CreditCard, TrendingUp, Loader2 } from "lucide-react";

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
  const { data: payments, loading } = useSupabaseQuery(() => getPayments(), []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  const allPayments = (payments || []) as PaymentRow[];

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

  const columns: Column<PaymentRow>[] = [
    { header: "Reference", accessor: (p) => <span className="font-mono text-xs font-bold">{p.reference}</span> },
    { header: "Booking", accessor: (p) => <span className="font-mono text-xs">{p.booking?.reference ?? "—"}</span> },
    { header: "Guest", accessor: (p) => <span className="font-medium">{p.booking?.guest?.full_name ?? "—"}</span> },
    { header: "Amount", accessor: (p) => <span className="font-semibold">{formatCurrency(Number(p.amount))}</span> },
    { header: "Method", accessor: (p) => <span className="text-xs">{PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.method}</span> },
    { header: "Status", accessor: (p) => <StatusBadge status={p.status} config={PAYMENT_STATUS_CONFIG} /> },
    { header: "Date", accessor: (p) => <span className="text-sm">{formatDate(p.created_at)}</span> },
    { header: "Note", accessor: (p) => <span className="text-xs text-muted-foreground">{p.notes ?? ""}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Track all payments and transactions" action={{ label: "Record Payment" }} />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collected" value={formatCurrency(totalCompleted)} icon={Wallet} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Pending" value={formatCurrency(totalPending)} icon={Clock} iconClassName="bg-amber-50 text-amber-600" />
        <StatCard title="Transactions" value={allPayments.length} icon={CreditCard} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard title="Today" value={formatCurrency(allPayments.filter((p) => p.status === "COMPLETED" && p.created_at?.startsWith(new Date().toISOString().split("T")[0])).reduce((s, p) => s + Number(p.amount), 0))} icon={TrendingUp} iconClassName="bg-purple-50 text-purple-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Method" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(p) => p.id} total={filtered.length} emptyMessage="No payments found" />
    </div>
  );
}
