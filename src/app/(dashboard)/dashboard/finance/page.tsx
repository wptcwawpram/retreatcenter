"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import {
  getFinanceRecords, createFinanceRecord, updateFinanceRecord, deleteFinanceRecord,
  getFinanceAccounts, createFinanceAccount, updateFinanceAccount, deleteFinanceAccount, setDefaultFinanceAccount,
  getFinanceCategories, createFinanceCategory, deleteFinanceCategory,
  getFinanceTransfers, createFinanceTransfer,
} from "@/lib/supabase/queries";
import { useSupabaseQuery } from "@/hooks/use-supabase-query";
import { formatCurrency, formatDate } from "@/lib/format";
import { downloadCSV } from "@/lib/export-csv";
import {
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight,
  Loader2, Trash2, AlertCircle, Landmark, Smartphone, Banknote,
  ArrowRightLeft, X, Edit2, Tag, Wallet, PiggyBank,
  Download, Plus, Star, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FinanceRecord, FinanceAccount, FinanceCategory, FinanceTransfer } from "@/lib/supabase/types";

// ── Simple Modal ──────────────────────────────────────────────
function SimpleModal({ open, onClose, title, children, className }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className={cn("relative z-10 w-full max-w-[calc(100%-2rem)] rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl sm:max-w-md animate-in fade-in-0 zoom-in-95", className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Form Modal ────────────────────────────────────────────────
interface FormField {
  name: string; label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea" | "checkbox";
  placeholder?: string; required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
  colSpan?: 1 | 2; min?: number; step?: number;
  hidden?: boolean;
}

function FormModal({ open, onClose, title, fields, initialValues, onSubmit, submitLabel, extraContent }: {
  open: boolean; onClose: () => void; title: string; fields: FormField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: any; onSubmit: (values: Record<string, unknown>) => Promise<void>;
  submitLabel?: string; extraContent?: (values: Record<string, unknown>, setValues: (v: Record<string, unknown>) => void) => React.ReactNode;
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const defaults: Record<string, unknown> = {};
      fields.forEach((f) => {
        defaults[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? (f.type === "number" ? "" : f.type === "checkbox" ? false : "");
      });
      setValues(defaults);
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try { await onSubmit(values); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  const updateValue = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <SimpleModal open={open} onClose={onClose} title={title} className="sm:max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.filter((f) => !f.hidden).map((field) => (
            <div key={field.name} className={field.colSpan === 2 ? "sm:col-span-2" : ""}>
              {field.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={field.name} checked={!!values[field.name]} onChange={(e) => updateValue(field.name, e.target.checked)} className="h-4 w-4 rounded border-border" />
                  <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
                </div>
              ) : (
                <>
                  <Label htmlFor={field.name} className="mb-1.5 block text-sm">
                    {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </Label>
                  {field.type === "select" ? (
                    <select id={field.name} value={String(values[field.name] ?? "")} onChange={(e) => updateValue(field.name, e.target.value)} required={field.required}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">{"Select..."}</option>
                      {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : field.type === "textarea" ? (
                    <Textarea id={field.name} value={String(values[field.name] ?? "")} onChange={(e) => updateValue(field.name, e.target.value)} placeholder={field.placeholder} required={field.required} rows={3} />
                  ) : (
                    <Input id={field.name} type={field.type || "text"} value={values[field.name] === undefined ? "" : values[field.name] as string | number} onChange={(e) => updateValue(field.name, field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} placeholder={field.type === "number" ? undefined : field.placeholder} required={field.required} min={field.min} step={field.step} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        {extraContent?.(values, setValues)}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}
          </div>
        )}
        <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>{"Cancel"}</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Saving..."}</> : (submitLabel ?? "Create")}
          </Button>
        </div>
      </form>
    </SimpleModal>
  );
}

// ── Constants ─────────────────────────────────────────────────
const ACCOUNT_TYPE_ICONS: Record<string, typeof Landmark> = {
  BANK: Landmark, MOMO: Smartphone, CASH: Banknote, PETTY_CASH: PiggyBank, OTHER: Wallet,
};
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: "Bank Account", MOMO: "Mobile Money", CASH: "Cash", PETTY_CASH: "Petty Cash", OTHER: "Other",
};

const s = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

// ── Main Page ─────────────────────────────────────────────────
export default function FinancePage() {
  const { data: finance, loading: loadingRecords, refetch: refetchRecords } = useSupabaseQuery(() => getFinanceRecords(), []);
  const { data: accounts, loading: loadingAccounts, refetch: refetchAccounts } = useSupabaseQuery(() => getFinanceAccounts(), []);
  const { data: categories, loading: loadingCats, refetch: refetchCats } = useSupabaseQuery(() => getFinanceCategories(), []);
  const { data: transfers, loading: loadingTransfers, refetch: refetchTransfers } = useSupabaseQuery(() => getFinanceTransfers(), []);

  const [showAdd, setShowAdd] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editAccount, setEditAccount] = useState<FinanceAccount | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", amount: "", description: "" });
  const [transferError, setTransferError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [addingCat, setAddingCat] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const allRecords: FinanceRecord[] = (finance || []) as FinanceRecord[];
  const allAccounts: FinanceAccount[] = (accounts || []) as FinanceAccount[];
  const allCategories: FinanceCategory[] = (categories || []) as FinanceCategory[];
  const allTransfers: FinanceTransfer[] = (transfers || []) as FinanceTransfer[];

  const incomeCategories = allCategories.filter((c) => c.type === "INCOME" && c.is_active);
  const expenseCategories = allCategories.filter((c) => c.type === "EXPENSE" && c.is_active);
  const activeAccounts = allAccounts.filter((a) => a.is_active);
  const filtered = allRecords.filter((f) => typeFilter === "ALL" || f.type === typeFilter);

  const totalIncome = allRecords.filter((f) => f.type === "INCOME").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalExpenses = allRecords.filter((f) => f.type === "EXPENSE").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalAccountBalance = activeAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const loading = loadingRecords || loadingAccounts || loadingCats;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const accountMap: Record<string, string> = {};
  allAccounts.forEach((a) => { accountMap[a.id] = String(a.name); });

  // ── Compute per-account inflows/outflows ──
  const accountInflows: Record<string, number> = {};
  const accountOutflows: Record<string, number> = {};
  allRecords.forEach((r) => {
    if (!r.account_id) return;
    if (r.type === "INCOME") accountInflows[r.account_id] = (accountInflows[r.account_id] || 0) + Number(r.amount);
    else accountOutflows[r.account_id] = (accountOutflows[r.account_id] || 0) + Number(r.amount);
  });

  // ── Export ──
  const handleExport = () => {
    downloadCSV("accounting-records", ["Date", "Type", "Category", "Description", "Account", "Amount", "Payment Method"], allRecords.map((r) => [
      r.date ? formatDate(r.date) : "", s(r.type), s(r.category), s(r.description),
      r.account_id ? accountMap[r.account_id] || "" : "", Number(r.amount), s(r.payment_method),
    ]));
  };

  // ── Record columns ──
  const recordColumns: Column<FinanceRecord>[] = [
    { header: "Date", accessor: (f) => <span className="text-xs text-muted-foreground">{s(f.date ? formatDate(f.date) : "—")}</span> },
    { header: "Type", accessor: (f) => (
      <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-medium border rounded-full px-2 py-0.5", f.type === "INCOME" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
        {f.type === "INCOME" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {s(f.type)}
      </span>
    )},
    { header: "Category", accessor: (f) => <span className="font-medium text-sm">{s(f.category)}</span> },
    { header: "Description", accessor: (f) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] block">{s(f.description)}</span> },
    { header: "Account", accessor: (f) => (
      <select
        value={f.account_id || ""}
        onClick={(e) => e.stopPropagation()}
        onChange={async (e) => {
          e.stopPropagation();
          try {
            await updateFinanceRecord(f.id, { account_id: e.target.value || null });
            refetchRecords();
            refetchAccounts();
          } catch {}
        }}
        className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring min-w-[120px]"
      >
        <option value="">{"—"}</option>
        {activeAccounts.map((a) => <option key={a.id} value={a.id}>{s(a.name)}</option>)}
      </select>
    )},
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

  const transferColumns: Column<FinanceTransfer>[] = [
    { header: "Date", accessor: (t) => <span className="text-xs text-muted-foreground">{s(t.created_at ? formatDate(t.created_at) : "—")}</span> },
    { header: "From", accessor: (t) => <span className="text-sm font-medium">{s(typeof t.from_account === "object" && t.from_account ? t.from_account.name : t.from_account) || "—"}</span> },
    { header: "", accessor: () => <ArrowRightLeft className="h-4 w-4 text-muted-foreground mx-auto" /> },
    { header: "To", accessor: (t) => <span className="text-sm font-medium">{s(typeof t.to_account === "object" && t.to_account ? t.to_account.name : t.to_account) || "—"}</span> },
    { header: "Amount", accessor: (t) => <span className="font-semibold text-sm tabular-nums">{formatCurrency(Number(t.amount))}</span> },
    { header: "Note", accessor: (t) => <span className="text-xs text-muted-foreground line-clamp-1">{s(t.description) || "—"}</span> },
    { header: "Ref", accessor: (t) => <span className="font-mono text-[10px] text-muted-foreground">{s(t.reference) || "—"}</span> },
  ];

  // ── Record form fields (dynamic based on selected type) ──
  const getRecordFields = (selectedType: string): FormField[] => {
    const cats = selectedType === "INCOME" ? incomeCategories : selectedType === "EXPENSE" ? expenseCategories : [...incomeCategories, ...expenseCategories];
    const catOptions = [...cats.map((c) => ({ label: String(c.name), value: String(c.name) })), { label: "Other", value: "__OTHER__" }];

    return [
      { name: "type", label: "Type", type: "select", required: true, options: [{ label: "Income", value: "INCOME" }, { label: "Expense", value: "EXPENSE" }] },
      { name: "category", label: "Category", type: "select", required: true, options: catOptions },
      { name: "amount", label: "Amount (₵)", type: "number", required: true, min: 0, step: 0.01 },
      { name: "account_id", label: "Account", type: "select",
        options: [{ label: "-- No account --", value: "" }, ...activeAccounts.map((a) => ({ label: `${String(a.name)} (${String(ACCOUNT_TYPE_LABELS[a.type] || a.type)})`, value: String(a.id) }))]
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
  };

  const [addRecordType, setAddRecordType] = useState("INCOME");

  const handleAddRecord = async (values: Record<string, unknown>) => {
    let category = values.category as string;
    if (category === "__OTHER__") {
      category = values.custom_category as string;
      if (!category?.trim()) throw new Error("Please enter a category name");
      await createFinanceCategory({
        name: category.trim(),
        type: values.type as "INCOME" | "EXPENSE",
        icon: null, color: null, is_active: true, sort_order: 99,
      });
      refetchCats();
    }
    await createFinanceRecord({
      type: values.type as "INCOME" | "EXPENSE",
      category, amount: Number(values.amount),
      date: values.date as string, description: values.description as string,
      recorded_by: null, booking_id: null,
      account_id: (values.account_id as string) || null,
      category_id: null, reference: null,
      payment_method: (values.payment_method as string) || null,
    });
    refetchRecords();
    refetchAccounts();
  };

  const accountFields: FormField[] = [
    { name: "name", label: "Account Name", required: true, placeholder: "e.g. MTN MoMo, GCB Savings" },
    { name: "type", label: "Account Type", type: "select", required: true, options: Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => ({ label: v, value: k })) },
    { name: "provider", label: "Provider / Bank", placeholder: "e.g. MTN, GCB, Stanbic" },
    { name: "account_number", label: "Account Number", placeholder: "e.g. 023-XXX-XXXX" },
    { name: "balance", label: "Opening Balance (₵)", type: "number", min: 0, step: 0.01 },
    { name: "notes", label: "Notes", type: "textarea", placeholder: "Account notes" },
  ];

  const handleAddAccount = async (values: Record<string, unknown>) => {
    await createFinanceAccount({
      name: values.name as string, type: values.type as FinanceAccount["type"],
      provider: (values.provider as string) || null, account_number: (values.account_number as string) || null,
      balance: Number(values.balance) || 0, currency: "GHS", is_default: false, is_active: true,
      notes: (values.notes as string) || null,
    });
    refetchAccounts();
  };

  const handleEditAccount = async (values: Record<string, unknown>) => {
    if (!editAccount) return;
    await updateFinanceAccount(editAccount.id, {
      name: values.name as string, type: values.type as FinanceAccount["type"],
      provider: (values.provider as string) || null, account_number: (values.account_number as string) || null,
      notes: (values.notes as string) || null,
    });
    setEditAccount(null);
    refetchAccounts();
  };

  const handleSetDefault = async (id: string) => {
    try { await setDefaultFinanceAccount(id); refetchAccounts(); } catch {}
  };

  const handleTransfer = async () => {
    setTransferError("");
    if (!transferForm.from || !transferForm.to || !transferForm.amount) { setTransferError("All fields are required"); return; }
    if (transferForm.from === transferForm.to) { setTransferError("Cannot transfer to same account"); return; }
    setTransferring(true);
    try {
      await createFinanceTransfer({ from_account_id: transferForm.from, to_account_id: transferForm.to, amount: Number(transferForm.amount), description: transferForm.description || undefined });
      setShowTransfer(false);
      setTransferForm({ from: "", to: "", amount: "", description: "" });
      refetchAccounts();
      refetchTransfers();
    } catch (err) { setTransferError(err instanceof Error ? err.message : "Transfer failed"); }
    finally { setTransferring(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      if (deleteItem.type === "record") await deleteFinanceRecord(deleteItem.id);
      else if (deleteItem.type === "account") await deleteFinanceAccount(deleteItem.id);
      else if (deleteItem.type === "category") await deleteFinanceCategory(deleteItem.id);
      setDeleteItem(null);
      refetchRecords(); refetchAccounts(); refetchCats();
    } finally { setDeleting(false); }
  };

  const handleAddCat = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      await createFinanceCategory({ name: newCatName.trim(), type: newCatType, icon: null, color: null, is_active: true, sort_order: 99 });
      setNewCatName("");
      refetchCats();
    } catch {}
    finally { setAddingCat(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{"Accounting"}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {"Income, expenses, fund balances — weekly and monthly records in ₵. Categories classify the type (Offering, Tithe, Rent). Funds track which pot of money (General, Building, Missions)."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />{"Export CSV"}
          </Button>
          <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" />{"New transaction"}
          </Button>
        </div>
      </div>

      {/* ═══ ACCOUNTS SECTION ═══ */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />{"Accounts"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{"Total across all accounts: "}<strong>{formatCurrency(totalAccountBalance)}</strong></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowTransfer(true)}>
              <ArrowRightLeft className="h-3.5 w-3.5" />{"Transfer"}
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setShowAddAccount(true)}>
              <Plus className="h-3.5 w-3.5" />{"New account"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeAccounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.type] || Wallet;
            const inflow = accountInflows[account.id] || 0;
            const outflow = accountOutflows[account.id] || 0;
            return (
              <div key={account.id} className="rounded-xl border border-border/60 bg-background p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all group relative">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm truncate">{s(account.name)}</h3>
                      {account.is_default === true && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {s(ACCOUNT_TYPE_LABELS[account.type] || account.type)}
                      {account.provider ? ` · ${s(account.provider)}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditAccount(account)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={() => setDeleteItem({ id: account.id, type: "account", label: String(account.name) })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className={cn("text-xl font-bold tabular-nums", Number(account.balance) >= 0 ? "text-foreground" : "text-red-600")}>
                    {formatCurrency(Number(account.balance))}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-teal-500">{"+₵"}{inflow.toLocaleString("en-GH", { minimumFractionDigits: 2 })} {"in"}</span>
                    <span className="text-[10px] text-red-500">{"-₵"}{outflow.toLocaleString("en-GH", { minimumFractionDigits: 2 })} {"out"}</span>
                  </div>
                </div>
                {!account.is_default && (
                  <button onClick={() => handleSetDefault(account.id)} className="text-[10px] text-primary hover:underline mt-1.5">
                    {"Make default"}
                  </button>
                )}
              </div>
            );
          })}
          {activeAccounts.length === 0 && (
            <div className="col-span-full text-center py-8 border border-dashed border-border/60 rounded-xl text-sm text-muted-foreground">
              {"No accounts yet. Add your first bank, MoMo, or cash account."}
            </div>
          )}
        </div>

        {/* Recent transfers (shown inside accounts card) */}
        {allTransfers.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowRightLeft className="h-3 w-3" />{"Recent Transfers"}
            </h3>
            <div className="space-y-1">
              {allTransfers.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-lg hover:bg-muted/20">
                  <span className="text-muted-foreground w-20 shrink-0">{t.created_at ? formatDate(t.created_at) : "—"}</span>
                  <span className="font-medium truncate">{s(typeof t.from_account === "object" && t.from_account ? t.from_account.name : "")}</span>
                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{s(typeof t.to_account === "object" && t.to_account ? t.to_account.name : "")}</span>
                  <span className="ml-auto font-semibold tabular-nums shrink-0">{formatCurrency(Number(t.amount))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ RECORDS + CATEGORIES TABS ═══ */}
      <div className="flex items-center gap-1 border border-border/60 rounded-lg p-1 bg-muted/20 w-fit">
        <button onClick={() => setShowCategories(false)} className={cn("px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", !showCategories ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {"Transactions"}
          <span className="text-[10px] font-bold bg-muted/50 px-1.5 py-0.5 rounded-full">{String(allRecords.length)}</span>
        </button>
        <button onClick={() => setShowCategories(true)} className={cn("px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", showCategories ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {"Categories"}
          <span className="text-[10px] font-bold bg-muted/50 px-1.5 py-0.5 rounded-full">{String(allCategories.length)}</span>
        </button>
      </div>

      {!showCategories ? (
        <>
          {/* Filter + Summary */}
          <div className="flex flex-wrap items-center gap-3">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ALL">{"All Records"}</option>
              <option value="INCOME">{"Income"}</option>
              <option value="EXPENSE">{"Expenses"}</option>
            </select>
            <div className="flex gap-4 ml-auto text-sm">
              <span className="text-teal-500 font-medium tabular-nums">{"+₵"}{totalIncome.toLocaleString("en-GH", { minimumFractionDigits: 2 })} {"in"}</span>
              <span className="text-red-500 font-medium tabular-nums">{"-₵"}{totalExpenses.toLocaleString("en-GH", { minimumFractionDigits: 2 })} {"out"}</span>
            </div>
          </div>

          {/* MANUAL ENTRIES section header */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Plus className="h-3 w-3" />{"Manual Entries"}
            </div>
          )}
          <DataTable columns={recordColumns} data={filtered} keyExtractor={(f) => f.id} total={filtered.length} emptyMessage="No records found" />
        </>
      ) : (
        /* ═══ CATEGORIES TAB ═══ */
        <div className="space-y-5">
          {/* Add category inline */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">{"New Category"}</Label>
              <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category name" className="h-9" />
            </div>
            <select value={newCatType} onChange={(e) => setNewCatType(e.target.value as "INCOME" | "EXPENSE")}
              className="h-9 w-[130px] rounded-md border border-input bg-background px-3 text-sm">
              <option value="INCOME">{"Income"}</option>
              <option value="EXPENSE">{"Expense"}</option>
            </select>
            <Button size="sm" onClick={handleAddCat} disabled={addingCat || !newCatName.trim()} className="h-9 gap-1.5">
              {addingCat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}{"Add"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight className="h-4 w-4 text-teal-500" />
                <h3 className="text-sm font-semibold">{"Income Categories"}</h3>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{String(incomeCategories.length)}</span>
              </div>
              <div className="space-y-1">
                {allCategories.filter((c) => c.type === "INCOME").map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                    <Tag className="h-3.5 w-3.5 text-teal-500" />
                    <span className={cn("text-sm flex-1", !cat.is_active && "text-muted-foreground line-through")}>{s(cat.name)}</span>
                    <Button variant="ghost" size="icon-xs" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteItem({ id: cat.id, type: "category", label: String(cat.name) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {incomeCategories.length === 0 && <p className="text-xs text-muted-foreground py-2">{"No income categories"}</p>}
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold">{"Expense Categories"}</h3>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{String(expenseCategories.length)}</span>
              </div>
              <div className="space-y-1">
                {allCategories.filter((c) => c.type === "EXPENSE").map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                    <Tag className="h-3.5 w-3.5 text-red-500" />
                    <span className={cn("text-sm flex-1", !cat.is_active && "text-muted-foreground line-through")}>{s(cat.name)}</span>
                    <Button variant="ghost" size="icon-xs" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteItem({ id: cat.id, type: "category", label: String(cat.name) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {expenseCategories.length === 0 && <p className="text-xs text-muted-foreground py-2">{"No expense categories"}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Add Record - with dynamic categories based on type */}
      <FormModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="New transaction"
        fields={getRecordFields(addRecordType)}
        onSubmit={handleAddRecord}
        submitLabel="Add Record"
        extraContent={(values, setValues) => (
          <>
            {/* Listen for type changes to update category list */}
            {values.type !== addRecordType && (() => { setAddRecordType(values.type as string || "INCOME"); return null; })()}
            {/* Show custom category input when "Other" is selected */}
            {values.category === "__OTHER__" && (
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-sm">{"Custom Category Name"}<span className="text-red-500 ml-0.5">*</span></Label>
                <Input value={String(values.custom_category ?? "")} onChange={(e) => setValues({ ...values, custom_category: e.target.value })} placeholder="e.g. Tithe, Love Offering" />
              </div>
            )}
          </>
        )}
      />

      <FormModal open={showAddAccount} onClose={() => setShowAddAccount(false)} title="New account" fields={accountFields} onSubmit={handleAddAccount} submitLabel="Create Account" />
      {editAccount && (
        <FormModal open={!!editAccount} onClose={() => setEditAccount(null)} title={`Edit ${String(editAccount.name)}`}
          fields={accountFields.filter((f) => f.name !== "balance")} initialValues={editAccount} onSubmit={handleEditAccount} submitLabel="Update" />
      )}

      {/* Transfer modal */}
      <SimpleModal open={showTransfer} onClose={() => { setShowTransfer(false); setTransferError(""); }} title="Transfer between accounts">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{"From"}</Label>
            <select value={transferForm.from} onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">{"Choose account..."}</option>
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>{s(a.name)} {"—"} {formatCurrency(Number(a.balance))}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{"To"}</Label>
            <select value={transferForm.to} onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">{"Choose account..."}</option>
              {activeAccounts.filter((a) => a.id !== transferForm.from).map((a) => (
                <option key={a.id} value={a.id}>{s(a.name)} {"—"} {formatCurrency(Number(a.balance))}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{"Amount (₵)"}</Label>
            <Input type="number" min={0} step={0.01} value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">{"Note (optional)"}</Label>
            <Input value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} placeholder="e.g. move offering to savings" className="h-10" />
          </div>
          {transferError && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {transferError}
            </div>
          )}
          <Button onClick={handleTransfer} disabled={transferring} className="w-full h-10">
            {transferring ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Transferring..."}</> : "Record transfer"}
          </Button>
        </div>
      </SimpleModal>

      {/* Delete confirmation */}
      <SimpleModal open={!!deleteItem} onClose={() => setDeleteItem(null)} title={`Delete ${s(deleteItem?.type)}`}>
        <div className="flex items-start gap-3 text-sm mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p>{"Delete"} <strong>{s(deleteItem?.label)}</strong>{"? This cannot be undone."}</p>
        </div>
        <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
          <Button variant="outline" onClick={() => setDeleteItem(null)} disabled={deleting}>{"Cancel"}</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Deleting..."}</> : "Delete"}
          </Button>
        </div>
      </SimpleModal>
    </div>
  );
}
