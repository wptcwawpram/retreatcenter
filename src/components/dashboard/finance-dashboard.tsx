"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  ArrowRight, ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURRENCY } from "@/lib/constants";
import { getDashboardStats, getFinanceRecords, getPayments } from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FinanceDashboard({ greeting }: { greeting: string }) {
  const { data: stats, loading: statsLoading } = useSupabaseQuery(() => getDashboardStats(), []);
  const { data: finance, loading: financeLoading } = useSupabaseQuery(() => getFinanceRecords(), []);
  const { data: payments } = useSupabaseQuery(() => getPayments(), []);

  if (statsLoading || financeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading finance dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats || { incomeToday: 0, pendingPayments: 0 };
  const allRecords = finance || [];
  const allPayments = payments || [];

  const totalIncome = useMemo(() => allRecords.filter((f) => f.type === "INCOME").reduce((sum, f) => sum + Number(f.amount), 0), [allRecords]);
  const totalExpenses = useMemo(() => allRecords.filter((f) => f.type === "EXPENSE").reduce((sum, f) => sum + Number(f.amount), 0), [allRecords]);
  const netIncome = totalIncome - totalExpenses;

  const incomeBreakdown = useMemo(() => {
    return Object.entries(
      allRecords.filter((f) => f.type === "INCOME").reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + Number(f.amount);
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]);
  }, [allRecords]);

  const recentTransactions = useMemo(() =>
    [...allRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [allRecords]
  );

  const recentPayments = useMemo(() =>
    [...allPayments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [allPayments]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Financial overview &mdash; income, expenses, and payment tracking</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/finance">
            <Button size="sm" variant="outline" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />Finance Records
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <CreditCard className="h-3.5 w-3.5" />Payments
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Income Today" value={`${CURRENCY.symbol}${s.incomeToday.toLocaleString()}`} subtitle="Collected today" icon={TrendingUp} iconClassName="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} subtitle="All recorded income" icon={ArrowUpRight} iconClassName="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} subtitle="All recorded expenses" icon={TrendingDown} iconClassName="bg-red-500/10 text-red-600" />
        <StatCard title="Net Income" value={formatCurrency(netIncome)} subtitle={netIncome >= 0 ? "Profit" : "Loss"} icon={DollarSign} iconClassName={netIncome >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income Breakdown */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Income Breakdown</h3>
          {incomeBreakdown.length > 0 ? (
            <div className="space-y-3">
              {incomeBreakdown.map(([cat, amount]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs w-28 text-muted-foreground truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${totalIncome > 0 ? (amount / totalIncome) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-24 text-right">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No income records</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Transactions</h3>
            <Link href="/dashboard/finance" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-1">
              {recentTransactions.map((record) => (
                <div key={record.id} className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    record.type === "INCOME" ? "bg-emerald-500/10" : "bg-red-500/10"
                  )}>
                    {record.type === "INCOME"
                      ? <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      : <ArrowDownRight className="h-4 w-4 text-red-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{record.category}</p>
                      <Badge className={cn(
                        "text-[10px] border",
                        record.type === "INCOME" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                      )}>{record.type}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{record.description} &middot; {formatDate(record.date)}</p>
                  </div>
                  <span className={cn("text-sm font-semibold tabular-nums shrink-0", record.type === "INCOME" ? "text-emerald-600" : "text-red-600")}>
                    {record.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(record.amount))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions recorded</p>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Recent Payments</h3>
          <Link href="/dashboard/payments" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentPayments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentPayments.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Badge className={cn("text-[10px] border",
                    p.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    p.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-red-50 text-red-700 border-red-200"
                  )}>{p.status}</Badge>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(Number(p.amount))}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{p.method?.replace(/_/g, " ") ?? "—"} &middot; {formatDate(p.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No recent payments</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/dashboard/reports" className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-border transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Reports</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generate financial reports and summaries</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Pending Payments</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.pendingPayments} booking{s.pendingPayments !== 1 ? "s" : ""} with outstanding balance</p>
            </div>
            <span className="text-lg font-bold text-amber-600">{s.pendingPayments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
