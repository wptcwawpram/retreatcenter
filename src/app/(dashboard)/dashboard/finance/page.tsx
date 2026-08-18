"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { FormDialog, type FormField } from "@/components/dashboard/form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  getFinanceRecords, createFinanceRecord, deleteFinanceRecord,
  getFinanceAccounts, createFinanceAccount, updateFinanceAccount, deleteFinanceAccount,
  getFinanceCategories, createFinanceCategory, deleteFinanceCategory,
  getFinanceTransfers, createFinanceTransfer,
} from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Loader2, Trash2, AlertCircle, Landmark, Smartphone, Banknote,
  ArrowRightLeft, Plus, Edit2, Tag, Wallet, PiggyBank,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { FinanceRecord, FinanceAccount, FinanceCategory, FinanceTransfer } from "@/lib/supabase/types";

const ACCOUNT_TYPE_ICONS: Record<string, typeof Landmark> = {
  BANK: Landmark,
  MOMO: Smartphone,
  CASH: Banknote,
  PETTY_CASH: PiggyBank,
  OTHER: Wallet,
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: "Bank Account",
  MOMO: "Mobile Money",
  CASH: "Cash",
  PETTY_CASH: "Petty Cash",
  OTHER: "Other",
};

type Tab = "records" | "accounts" | "categories" | "transfers";

export default function FinancePage() {
  const { data: finance, loading: loadingRecords, refetch: refetchRecords } = useSupabaseQuery(() => getFinanceRecords(), []);
  const { data: accounts, loading: loadingAccounts, refetch: refetchAccounts } = useSupabaseQuery(() => getFinanceAccounts(), []);
  const { data: categories, loading: loadingCats, refetch: refetchCats } = useSupabaseQuery(() => getFinanceCategories(), []);
  const { data: transfers, loading: loadingTransfers, refetch: refetchTransfers } = useSupabaseQuery(() => getFinanceTransfers(), []);

  const [tab, setTab] = useState<Tab>("records");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editAccount, setEditAccount] = useState<FinanceAccount | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", amount: "", description: "" });
  const [transferError, setTransferError] = useState("");

  const allRecords = finance || [];
  const allAccounts = (accounts || []) as FinanceAccount[];
  const allCategories = (categories || []) as FinanceCategory[];
  const allTransfers = (transfers || []) as FinanceTransfer[];

  const s = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const incomeCategories = useMemo(() => allCategories.filter((c) => c.type === "INCOME" && c.is_active), [allCategories]);
  const expenseCategories = useMemo(() => allCategories.filter((c) => c.type === "EXPENSE" && c.is_active), [allCategories]);
  const activeAccounts = useMemo(() => allAccounts.filter((a) => a.is_active), [allAccounts]);

  const filtered = useMemo(() =>
    allRecords.filter((f) => typeFilter === "ALL" || f.type === typeFilter),
    [allRecords, typeFilter]
  );

  const totalIncome = useMemo(() => allRecords.filter((f) => f.type === "INCOME").reduce((s, f) => s + Number(f.amount), 0), [allRecords]);
  const totalExpenses = useMemo(() => allRecords.filter((f) => f.type === "EXPENSE").reduce((s, f) => s + Number(f.amount), 0), [allRecords]);
  const netIncome = totalIncome - totalExpenses;
  const totalAccountBalance = useMemo(() => activeAccounts.reduce((s, a) => s + Number(a.balance), 0), [activeAccounts]);

  const loading = loadingRecords || loadingAccounts || loadingCats;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // ── Record Form Fields ──────────────────────────────────────

  const recordFields: FormField[] = [
    { name: "type", label: "Type", type: "select", required: true, options: [{ label: "Income", value: "INCOME" }, { label: "Expense", value: "EXPENSE" }] },
    { name: "category", label: "Category", type: "select", required: true,
      options: [...incomeCategories.map((c) => ({ label: `${c.name}`, value: c.name })), ...expenseCategories.map((c) => ({ label: `${c.name}`, value: c.name }))]
    },
    { name: "amount", label: "Amount (GH₵)", type: "number", required: true, min: 0, step: 0.01 },
    { name: "account_id", label: "Account", type: "select",
      options: [{ label: "-- No account --", value: "" }, ...activeAccounts.map((a) => ({ label: `${a.name} (${ACCOUNT_TYPE_LABELS[a.type]})`, value: a.id }))]
    },
    { name: "date", label: "Date", type: "date", required: true, defaultValue: new Date().toISOString().split("T")[0] },
    { name: "payment_method", label: "Payment Method", type: "select",
      options: [
        { label: "Cash", value: "CASH" }, { label: "Mobile Money", value: "MOBILE_MONEY" },
        { label: "Bank Transfer", value: "BANK_TRANSFER" }, { label: "Cheque", value: "CHEQUE" },
        { label: "Paystack", value: "PAYSTACK" }, { label: "Other", value: "OTHER" },
      ]
    },
    { name: "description", label: "Description", type: "textarea", required: true, colSpan: 2, placeholder: "Describe the transaction" },
  ];

  const handleAddRecord = async (values: Record<string, unknown>) => {
    await createFinanceRecord({
      type: values.type as "INCOME" | "EXPENSE",
      category: values.category as string,
      amount: Number(values.amount),
      date: values.date as string,
      description: values.description as string,
      recorded_by: null,
      booking_id: null,
      account_id: (values.account_id as string) || null,
      category_id: null,
      reference: null,
      payment_method: (values.payment_method as string) || null,
    });
    refetchRecords();
    refetchAccounts();
  };

  // ── Account Form Fields ─────────────────────────────────────

  const accountFields: FormField[] = [
    { name: "name", label: "Account Name", required: true, placeholder: "e.g. MTN MoMo, GCB Savings" },
    { name: "type", label: "Account Type", type: "select", required: true, options: Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => ({ label: v, value: k })) },
    { name: "provider", label: "Provider / Bank", placeholder: "e.g. MTN, GCB, Stanbic" },
    { name: "account_number", label: "Account Number", placeholder: "e.g. 023-XXX-XXXX" },
    { name: "balance", label: "Opening Balance (GH₵)", type: "number", defaultValue: "0", min: 0, step: 0.01 },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Account notes" },
  ];

  const handleAddAccount = async (values: Record<string, unknown>) => {
    await createFinanceAccount({
      name: values.name as string,
      type: values.type as FinanceAccount["type"],
      provider: (values.provider as string) || null,
      account_number: (values.account_number as string) || null,
      balance: Number(values.balance) || 0,
      currency: "GHS",
      is_default: false,
      is_active: true,
      notes: (values.notes as string) || null,
    });
    refetchAccounts();
  };

  const handleEditAccount = async (values: Record<string, unknown>) => {
    if (!editAccount) return;
    await updateFinanceAccount(editAccount.id, {
      name: values.name as string,
      type: values.type as FinanceAccount["type"],
      provider: (values.provider as string) || null,
      account_number: (values.account_number as string) || null,
      notes: (values.notes as string) || null,
    });
    setEditAccount(null);
    refetchAccounts();
  };

  // ── Category Form Fields ────────────────────────────────────

  const categoryFields: FormField[] = [
    { name: "name", label: "Category Name", required: true, placeholder: "e.g. Room Booking, Utilities" },
    { name: "type", label: "Type", type: "select", required: true, options: [{ label: "Income", value: "INCOME" }, { label: "Expense", value: "EXPENSE" }] },
    { name: "sort_order", label: "Sort Order", type: "number", defaultValue: "0", min: 0 },
  ];

  const handleAddCategory = async (values: Record<string, unknown>) => {
    await createFinanceCategory({
      name: values.name as string,
      type: values.type as "INCOME" | "EXPENSE",
      icon: null,
      color: null,
      is_active: true,
      sort_order: Number(values.sort_order) || 0,
    });
    refetchCats();
  };

  // ── Transfer ────────────────────────────────────────────────

  const handleTransfer = async () => {
    setTransferError("");
    if (!transferForm.from || !transferForm.to || !transferForm.amount) {
      setTransferError("All fields are required");
      return;
    }
    setTransferring(true);
    try {
      await createFinanceTransfer({
        from_account_id: transferForm.from,
        to_account_id: transferForm.to,
        amount: Number(transferForm.amount),
        description: transferForm.description || undefined,
      });
      setShowTransfer(false);
      setTransferForm({ from: "", to: "", amount: "", description: "" });
      refetchAccounts();
      refetchTransfers();
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      if (deleteItem.type === "record") await deleteFinanceRecord(deleteItem.id);
      else if (deleteItem.type === "account") await deleteFinanceAccount(deleteItem.id);
      else if (deleteItem.type === "category") await deleteFinanceCategory(deleteItem.id);
      setDeleteItem(null);
      refetchRecords();
      refetchAccounts();
      refetchCats();
    } finally { setDeleting(false); }
  };

  // ── Record Columns ──────────────────────────────────────────

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    allAccounts.forEach((a) => { map[a.id] = a.name; });
    return map;
  }, [allAccounts]);

  const recordColumns: Column<FinanceRecord>[] = [
    { header: "Date", accessor: (f) => <span className="text-xs text-muted-foreground">{s(f.date ? formatDate(f.date) : "—")}</span> },
    { header: "Type", accessor: (f) => (
      <Badge className={cn("text-[10px] border gap-0.5", f.type === "INCOME" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
        {f.type === "INCOME" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {s(f.type)}
      </Badge>
    )},
    { header: "Category", accessor: (f) => <span className="font-medium text-sm">{s(f.category)}</span> },
    { header: "Description", accessor: (f) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] block">{s(f.description)}</span> },
    { header: "Account", accessor: (f) => <span className="text-xs text-muted-foreground">{f.account_id ? s(accountMap[f.account_id]) || "—" : "—"}</span> },
    { header: "Amount", accessor: (f) => (
      <span className={cn("font-semibold text-sm tabular-nums", f.type === "INCOME" ? "text-teal-500" : "text-red-600")}>
        {f.type === "INCOME" ? "+" : "-"}{formatCurrency(Number(f.amount))}
      </span>
    )},
    { header: "", accessor: (f) => (
      <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteItem({ id: f.id, type: "record", label: formatCurrency(Number(f.amount)) }); }}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    )},
  ];

  // ── Transfer Columns ────────────────────────────────────────

  const transferColumns: Column<FinanceTransfer>[] = [
    { header: "Date", accessor: (t) => <span className="text-xs text-muted-foreground">{s(t.created_at ? formatDate(t.created_at) : "—")}</span> },
    { header: "From", accessor: (t) => <span className="text-sm font-medium">{s(typeof t.from_account === "object" && t.from_account ? t.from_account.name : t.from_account) || "—"}</span> },
    { header: "", accessor: () => <ArrowRightLeft className="h-4 w-4 text-muted-foreground mx-auto" /> },
    { header: "To", accessor: (t) => <span className="text-sm font-medium">{s(typeof t.to_account === "object" && t.to_account ? t.to_account.name : t.to_account) || "—"}</span> },
    { header: "Amount", accessor: (t) => <span className="font-semibold text-sm tabular-nums">{formatCurrency(Number(t.amount))}</span> },
    { header: "Description", accessor: (t) => <span className="text-xs text-muted-foreground line-clamp-1">{s(t.description) || "—"}</span> },
    { header: "Ref", accessor: (t) => <span className="font-mono text-[10px] text-muted-foreground">{s(t.reference) || "—"}</span> },
  ];

  // ── Tab buttons ─────────────────────────────────────────────

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "records", label: "Records", count: allRecords.length },
    { key: "accounts", label: "Accounts", count: activeAccounts.length },
    { key: "categories", label: "Categories", count: allCategories.length },
    { key: "transfers", label: "Transfers", count: allTransfers.length },
  ];

  const getAction = () => {
    if (tab === "records") return { label: "Add Record", onClick: () => setShowAdd(true) };
    if (tab === "accounts") return { label: "Add Account", onClick: () => setShowAddAccount(true) };
    if (tab === "categories") return { label: "Add Category", onClick: () => setShowAddCategory(true) };
    if (tab === "transfers") return { label: "Transfer Funds", onClick: () => setShowTransfer(true) };
    return { label: "Add", onClick: () => {} };
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Finance" description="Manage accounts, income, expenses, and transfers" action={getAction()} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} iconClassName="bg-teal-500/10 text-teal-500" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} iconClassName="bg-red-500/10 text-red-600" />
        <StatCard title="Net Income" value={formatCurrency(netIncome)} icon={DollarSign} iconClassName={netIncome >= 0 ? "bg-teal-500/10 text-teal-500" : "bg-red-500/10 text-red-600"} />
        <StatCard title="Account Balances" value={formatCurrency(totalAccountBalance)} icon={Wallet} iconClassName="bg-blue-500/10 text-blue-600" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border border-border/60 rounded-lg p-1 bg-muted/20 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="text-[10px] font-bold bg-muted/50 px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Records Tab ──────────────────────────────────── */}
      {tab === "records" && (
        <>
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
          <DataTable columns={recordColumns} data={filtered} keyExtractor={(f) => f.id} total={filtered.length} emptyMessage="No records found" />
        </>
      )}

      {/* ── Accounts Tab ─────────────────────────────────── */}
      {tab === "accounts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeAccounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type] || Wallet;
            return (
              <div key={account.id} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all group relative">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{s(account.name)}</h3>
                      {account.is_default === true && (
                        <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Default</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {s(ACCOUNT_TYPE_LABELS[account.type] || account.type)}
                      {account.provider ? ` — ${s(account.provider)}` : ""}
                    </p>
                    {account.account_number && (
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{s(account.account_number)}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className={cn("text-lg font-bold tabular-nums", Number(account.balance) >= 0 ? "text-teal-500" : "text-red-600")}>
                    {formatCurrency(Number(account.balance))}
                  </p>
                </div>
                <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditAccount(account)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={() => setDeleteItem({ id: account.id, type: "account", label: account.name })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {activeAccounts.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-border/60 rounded-xl text-sm text-muted-foreground">
              No accounts yet. Add your first bank, MoMo, or cash account.
            </div>
          )}
        </div>
      )}

      {/* ── Categories Tab ───────────────────────────────── */}
      {tab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Income Categories */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="h-4 w-4 text-teal-500" />
              <h3 className="text-sm font-semibold">Income Categories</h3>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{incomeCategories.length}</span>
            </div>
            <div className="space-y-1">
              {allCategories.filter((c) => c.type === "INCOME").map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                  <Tag className="h-3.5 w-3.5 text-teal-500" />
                  <span className={cn("text-sm flex-1", !cat.is_active && "text-muted-foreground line-through")}>{s(cat.name)}</span>
                  <Button variant="ghost" size="icon-xs" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteItem({ id: cat.id, type: "category", label: cat.name })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold">Expense Categories</h3>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{expenseCategories.length}</span>
            </div>
            <div className="space-y-1">
              {allCategories.filter((c) => c.type === "EXPENSE").map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                  <Tag className="h-3.5 w-3.5 text-red-500" />
                  <span className={cn("text-sm flex-1", !cat.is_active && "text-muted-foreground line-through")}>{s(cat.name)}</span>
                  <Button variant="ghost" size="icon-xs" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteItem({ id: cat.id, type: "category", label: cat.name })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Transfers Tab ────────────────────────────────── */}
      {tab === "transfers" && (
        <>
          {loadingTransfers ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <DataTable columns={transferColumns} data={allTransfers} keyExtractor={(t) => t.id} total={allTransfers.length} emptyMessage="No transfers yet" />
          )}
        </>
      )}

      {/* ── Add Record Dialog ────────────────────────────── */}
      <FormDialog open={showAdd} onOpenChange={setShowAdd} title="Add Finance Record" fields={recordFields} onSubmit={handleAddRecord} submitLabel="Add Record" />

      {/* ── Add Account Dialog ───────────────────────────── */}
      <FormDialog open={showAddAccount} onOpenChange={setShowAddAccount} title="Add Account" fields={accountFields} onSubmit={handleAddAccount} submitLabel="Create Account" />

      {/* ── Edit Account Dialog ──────────────────────────── */}
      {editAccount && (
        <FormDialog
          open={!!editAccount}
          onOpenChange={(o) => !o && setEditAccount(null)}
          title={`Edit ${editAccount.name}`}
          fields={accountFields.filter((f) => f.name !== "balance")}
          initialValues={editAccount}
          onSubmit={handleEditAccount}
          isEdit
        />
      )}

      {/* ── Add Category Dialog ──────────────────────────── */}
      <FormDialog open={showAddCategory} onOpenChange={setShowAddCategory} title="Add Category" fields={categoryFields} onSubmit={handleAddCategory} submitLabel="Create Category" />

      {/* ── Transfer Dialog ──────────────────────────────── */}
      <Dialog open={showTransfer} onOpenChange={(o) => { if (!o) { setShowTransfer(false); setTransferError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" /> Transfer Funds
            </DialogTitle>
            <DialogDescription>Move money between accounts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From Account</Label>
              <select
                value={transferForm.from}
                onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select source account</option>
                {activeAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{s(a.name)} ({s(ACCOUNT_TYPE_LABELS[a.type])}) — {formatCurrency(Number(a.balance))}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Account</Label>
              <select
                value={transferForm.to}
                onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select destination account</option>
                {activeAccounts.filter((a) => a.id !== transferForm.from).map((a) => (
                  <option key={a.id} value={a.id}>{s(a.name)} ({s(ACCOUNT_TYPE_LABELS[a.type])}) — {formatCurrency(Number(a.balance))}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (GH₵)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                placeholder="0.00"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={transferForm.description}
                onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                placeholder="e.g. MoMo to bank withdrawal"
                className="h-9"
              />
            </div>
            {transferError && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {transferError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransfer(false)} disabled={transferring}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={transferring}>
              {transferring ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Transferring...</> : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ──────────────────────────── */}
      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete {deleteItem?.type}</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>Delete <strong>{deleteItem?.label}</strong>? This cannot be undone.</p>
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
