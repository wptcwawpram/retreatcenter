"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DEMO_FINANCE } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/format";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

type FinanceRecord = (typeof DEMO_FINANCE)[number];

export default function FinancePage() {
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = DEMO_FINANCE.filter((f) => typeFilter === "ALL" || f.type === typeFilter);

  const totalIncome = DEMO_FINANCE.filter((f) => f.type === "INCOME").reduce((s, f) => s + f.amount, 0);
  const totalExpenses = DEMO_FINANCE.filter((f) => f.type === "EXPENSE").reduce((s, f) => s + f.amount, 0);
  const netIncome = totalIncome - totalExpenses;

  const columns: Column<FinanceRecord>[] = [
    { header: "Date", accessor: (f) => <span className="text-sm">{formatDate(f.date)}</span> },
    { header: "Type", accessor: (f) => (
      <Badge className={f.type === "INCOME" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
        {f.type === "INCOME" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {f.type}
      </Badge>
    )},
    { header: "Category", accessor: (f) => <span className="font-medium text-sm">{f.category}</span> },
    { header: "Description", accessor: (f) => <span className="text-sm text-muted-foreground">{f.description}</span> },
    { header: "Amount", accessor: (f) => (
      <span className={`font-semibold ${f.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>
        {f.type === "INCOME" ? "+" : "-"}{formatCurrency(f.amount)}
      </span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Income, expenses, and financial overview" action={{ label: "Add Record" }} />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconClassName="bg-red-50 text-red-600" />
        <StatCard
          title="Net Income"
          value={formatCurrency(netIncome)}
          icon={DollarSign}
          iconClassName={netIncome >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}
        />
      </div>

      {/* Income by Category */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Income Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(
              DEMO_FINANCE.filter((f) => f.type === "INCOME").reduce((acc, f) => {
                acc[f.category] = (acc[f.category] || 0) + f.amount;
                return acc;
              }, {} as Record<string, number>)
            ).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm">{cat}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(amount / totalIncome) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">{formatCurrency(amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter & Table */}
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "ALL")}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Records</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(f) => f.id} total={filtered.length} emptyMessage="No records found" />
    </div>
  );
}
