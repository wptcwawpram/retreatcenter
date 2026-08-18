"use client";

import { useState, useEffect, useRef } from "react";
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
  Loader2, Trash2, AlertCircle, Landmark, Smartphone, Banknote,
  ArrowRightLeft, X, Edit2, Tag, Wallet, PiggyBank,
  Download, Plus, Star, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FinanceRecord, FinanceAccount, FinanceCategory, FinanceTransfer } from "@/lib/supabase/types";

// Safe string — guarantees no object child ever reaches JSX
function ss(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch { return "[object]"; }
  }
  return String(v);
}

// Safe render — wraps any value in a span to guarantee it's a valid React child
function sr(v: unknown): React.ReactElement {
  return <span>{ss(v)}</span>;
}

// ── Simple Modal (no base-ui) ─────────────────────────────────
function SimpleModal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean;
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
      <div className={cn("relative z-10 w-full max-w-[calc(100%-2rem)] rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl animate-in fade-in-0 zoom-in-95", wide ? "sm:max-w-lg" : "sm:max-w-md")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold">{ss(title)}</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const ACCOUNT_TYPE_ICONS: Record<string, typeof Landmark> = {
  BANK: Landmark, MOMO: Smartphone, CASH: Banknote, PETTY_CASH: PiggyBank, OTHER: Wallet,
};
const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: "Bank Account", MOMO: "Mobile Money", CASH: "Cash", PETTY_CASH: "Petty Cash", OTHER: "Other",
};

// ── Main Page ─────────────────────────────────────────────────
export default function FinancePage() {
  const { data: finance, loading: l1, refetch: refetchRecords } = useSupabaseQuery(() => getFinanceRecords(), []);
  const { data: accounts, loading: l2, refetch: refetchAccounts } = useSupabaseQuery(() => getFinanceAccounts(), []);
  const { data: categories, loading: l3, refetch: refetchCats } = useSupabaseQuery(() => getFinanceCategories(), []);
  const { data: transfers, loading: l4, refetch: refetchTransfers } = useSupabaseQuery(() => getFinanceTransfers(), []);

  // All modals/dialogs gated behind state — NONE render on first paint
  const [modal, setModal] = useState<"none" | "addRecord" | "addAccount" | "editAccount" | "addCategory" | "transfer" | "delete">("none");
  const [editAccountData, setEditAccountData] = useState<FinanceAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: string; label: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showCategories, setShowCategories] = useState(false);
  const [saving, setSaving] = useState(false);

  // Transfer form
  const [txFrom, setTxFrom] = useState("");
  const [txTo, setTxTo] = useState("");
  const [txAmt, setTxAmt] = useState("");
  const [txNote, setTxNote] = useState("");
  const [txErr, setTxErr] = useState("");

  // Add record form
  const [arType, setArType] = useState("INCOME");
  const [arCat, setArCat] = useState("");
  const [arCustomCat, setArCustomCat] = useState("");
  const [arAmt, setArAmt] = useState("");
  const [arAcct, setArAcct] = useState("");
  const [arDate, setArDate] = useState(new Date().toISOString().split("T")[0]);
  const [arMethod, setArMethod] = useState("");
  const [arDesc, setArDesc] = useState("");
  const [arErr, setArErr] = useState("");

  // Add account form
  const [aaName, setAaName] = useState("");
  const [aaType, setAaType] = useState("BANK");
  const [aaProvider, setAaProvider] = useState("");
  const [aaNumber, setAaNumber] = useState("");
  const [aaBal, setAaBal] = useState("");
  const [aaNotes, setAaNotes] = useState("");
  const [aaErr, setAaErr] = useState("");

  // Add category form
  const [ncName, setNcName] = useState("");
  const [ncType, setNcType] = useState<"INCOME" | "EXPENSE">("INCOME");

  const loading = l1 || l2 || l3;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Cast all data to arrays — defensive
  const allRecords = Array.isArray(finance) ? finance as FinanceRecord[] : [];
  const allAccounts = Array.isArray(accounts) ? accounts as FinanceAccount[] : [];
  const allCategories = Array.isArray(categories) ? categories as FinanceCategory[] : [];
  const allTransfers = Array.isArray(transfers) ? transfers as FinanceTransfer[] : [];

  const incomeCategories = allCategories.filter((c) => ss(c.type) === "INCOME" && c.is_active);
  const expenseCategories = allCategories.filter((c) => ss(c.type) === "EXPENSE" && c.is_active);
  const activeAccounts = allAccounts.filter((a) => a.is_active);
  const filtered = allRecords.filter((f) => typeFilter === "ALL" || ss(f.type) === typeFilter);

  const totalIncome = allRecords.filter((f) => ss(f.type) === "INCOME").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalExpenses = allRecords.filter((f) => ss(f.type) === "EXPENSE").reduce((sum, f) => sum + Number(f.amount), 0);
  const totalBal = activeAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const accountMap: Record<string, string> = {};
  allAccounts.forEach((a) => { accountMap[ss(a.id)] = ss(a.name); });

  const accountIn: Record<string, number> = {};
  const accountOut: Record<string, number> = {};
  allRecords.forEach((r) => {
    const aid = ss(r.account_id);
    if (!aid) return;
    if (ss(r.type) === "INCOME") accountIn[aid] = (accountIn[aid] || 0) + Number(r.amount);
    else accountOut[aid] = (accountOut[aid] || 0) + Number(r.amount);
  });

  const handleExport = () => {
    downloadCSV("accounting-records", ["Date", "Type", "Category", "Description", "Account", "Amount", "Payment Method"], allRecords.map((r) => [
      r.date ? formatDate(String(r.date)) : "", ss(r.type), ss(r.category), ss(r.description),
      r.account_id ? accountMap[ss(r.account_id)] || "" : "", Number(r.amount), ss(r.payment_method),
    ]));
  };

  const openAddRecord = () => {
    setArType("INCOME"); setArCat(""); setArCustomCat(""); setArAmt(""); setArAcct(""); setArDate(new Date().toISOString().split("T")[0]); setArMethod(""); setArDesc(""); setArErr("");
    setModal("addRecord");
  };

  const handleAddRecord = async () => {
    setArErr("");
    let category = arCat;
    if (category === "__OTHER__") {
      if (!arCustomCat.trim()) { setArErr("Enter a category name"); return; }
      category = arCustomCat.trim();
      try {
        await createFinanceCategory({ name: category, type: arType as "INCOME" | "EXPENSE", icon: null, color: null, is_active: true, sort_order: 99 });
        refetchCats();
      } catch {}
    }
    if (!category || !arAmt || !arDesc) { setArErr("Fill in required fields"); return; }
    setSaving(true);
    try {
      await createFinanceRecord({
        type: arType as "INCOME" | "EXPENSE", category, amount: Number(arAmt),
        date: arDate, description: arDesc, recorded_by: null, booking_id: null,
        account_id: arAcct || null, category_id: null, reference: null,
        payment_method: arMethod || null,
      });
      setModal("none"); refetchRecords(); refetchAccounts();
    } catch (err) { setArErr(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const openAddAccount = () => {
    setAaName(""); setAaType("BANK"); setAaProvider(""); setAaNumber(""); setAaBal(""); setAaNotes(""); setAaErr("");
    setModal("addAccount");
  };

  const handleAddAccount = async () => {
    if (!aaName) { setAaErr("Name required"); return; }
    setSaving(true);
    try {
      await createFinanceAccount({
        name: aaName, type: aaType as FinanceAccount["type"],
        provider: aaProvider || null, account_number: aaNumber || null,
        balance: Number(aaBal) || 0, currency: "GHS", is_default: false, is_active: true, notes: aaNotes || null,
      });
      setModal("none"); refetchAccounts();
    } catch (err) { setAaErr(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const openEditAccount = (a: FinanceAccount) => {
    setEditAccountData(a); setAaName(ss(a.name)); setAaType(ss(a.type)); setAaProvider(ss(a.provider)); setAaNumber(ss(a.account_number)); setAaBal(String(a.balance ?? "")); setAaNotes(ss(a.notes)); setAaErr("");
    setModal("editAccount");
  };

  const handleEditAccount = async () => {
    if (!editAccountData) return;
    setSaving(true);
    try {
      await updateFinanceAccount(editAccountData.id, { name: aaName, type: aaType as FinanceAccount["type"], provider: aaProvider || null, account_number: aaNumber || null, balance: Number(aaBal) || 0, notes: aaNotes || null });
      setModal("none"); setEditAccountData(null); refetchAccounts();
    } catch (err) { setAaErr(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  };

  const openTransfer = () => {
    setTxFrom(""); setTxTo(""); setTxAmt(""); setTxNote(""); setTxErr("");
    setModal("transfer");
  };

  const handleTransfer = async () => {
    if (!txFrom || !txTo || !txAmt) { setTxErr("All fields required"); return; }
    if (txFrom === txTo) { setTxErr("Cannot transfer to same account"); return; }
    setSaving(true);
    try {
      await createFinanceTransfer({ from_account_id: txFrom, to_account_id: txTo, amount: Number(txAmt), description: txNote || undefined });
      setModal("none"); refetchAccounts(); refetchTransfers();
    } catch (err) { setTxErr(err instanceof Error ? err.message : "Transfer failed"); }
    finally { setSaving(false); }
  };

  const openDelete = (id: string, type: string, label: string) => {
    setDeleteTarget({ id, type, label }); setModal("delete");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === "record") await deleteFinanceRecord(deleteTarget.id);
      else if (deleteTarget.type === "account") await deleteFinanceAccount(deleteTarget.id);
      else if (deleteTarget.type === "category") await deleteFinanceCategory(deleteTarget.id);
      setModal("none"); setDeleteTarget(null); refetchRecords(); refetchAccounts(); refetchCats();
    } catch {} finally { setSaving(false); }
  };

  const handleSetDefault = async (id: string) => {
    try { await setDefaultFinanceAccount(id); refetchAccounts(); } catch {}
  };

  const handleAddCat = async () => {
    if (!ncName.trim()) return;
    setSaving(true);
    try {
      await createFinanceCategory({ name: ncName.trim(), type: ncType, icon: null, color: null, is_active: true, sort_order: 99 });
      setNcName(""); refetchCats();
    } catch {} finally { setSaving(false); }
  };

  const curCats = arType === "INCOME" ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{"Accounting"}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {"Income, expenses, fund balances — weekly and monthly records in ₵. Categories classify the type. Funds track which pot of money."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />{"Export CSV"}
          </Button>
          <Button size="sm" className="gap-1.5 shadow-sm" onClick={openAddRecord}>
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
            <p className="text-xs text-muted-foreground mt-0.5">{"Total across all accounts: "}<strong>{ss(formatCurrency(totalBal))}</strong></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={openTransfer}>
              <ArrowRightLeft className="h-3.5 w-3.5" />{"Transfer"}
            </Button>
            <Button size="sm" className="gap-1.5" onClick={openAddAccount}>
              <Plus className="h-3.5 w-3.5" />{"New account"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeAccounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[ss(account.type)] || Wallet;
            const inf = accountIn[ss(account.id)] || 0;
            const outf = accountOut[ss(account.id)] || 0;
            return (
              <div key={ss(account.id)} className="rounded-xl border border-border/60 bg-background p-4 hover:shadow-md hover:shadow-black/[0.03] transition-all group relative">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-sm truncate">{ss(account.name)}</h3>
                      {account.is_default === true && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {ss(ACCOUNT_TYPE_LABELS[ss(account.type)] || account.type)}
                      {account.provider ? " · " + ss(account.provider) : ""}
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-xs" onClick={() => openEditAccount(account)}><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={() => openDelete(ss(account.id), "account", ss(account.name))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className={cn("text-xl font-bold tabular-nums", Number(account.balance) >= 0 ? "text-foreground" : "text-red-600")}>
                    {ss(formatCurrency(Number(account.balance)))}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-teal-500">{"+₵" + inf.toFixed(2) + " in"}</span>
                    <span className="text-[10px] text-red-500">{"-₵" + outf.toFixed(2) + " out"}</span>
                  </div>
                </div>
                {!account.is_default && (
                  <button onClick={() => handleSetDefault(ss(account.id))} className="text-[10px] text-primary hover:underline mt-1.5">{"Make default"}</button>
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

        {/* Recent transfers */}
        {allTransfers.length > 0 && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowRightLeft className="h-3 w-3" />{"Recent Transfers"}
            </h3>
            <div className="space-y-1">
              {allTransfers.slice(0, 5).map((t) => {
                const fromName = typeof t.from_account === "object" && t.from_account !== null ? ss(t.from_account.name) : "";
                const toName = typeof t.to_account === "object" && t.to_account !== null ? ss(t.to_account.name) : "";
                return (
                  <div key={ss(t.id)} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-lg hover:bg-muted/20">
                    <span className="text-muted-foreground w-20 shrink-0">{t.created_at ? ss(formatDate(String(t.created_at))) : "—"}</span>
                    <span className="font-medium truncate">{fromName || "—"}</span>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">{toName || "—"}</span>
                    <span className="ml-auto font-semibold tabular-nums shrink-0">{ss(formatCurrency(Number(t.amount)))}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══ TABS: Transactions | Categories ═══ */}
      <div className="flex items-center gap-1 border border-border/60 rounded-lg p-1 bg-muted/20 w-fit">
        <button onClick={() => setShowCategories(false)} className={cn("px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", !showCategories ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {"Transactions"}<span className="text-[10px] font-bold bg-muted/50 px-1.5 py-0.5 rounded-full">{String(allRecords.length)}</span>
        </button>
        <button onClick={() => setShowCategories(true)} className={cn("px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", showCategories ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {"Categories"}<span className="text-[10px] font-bold bg-muted/50 px-1.5 py-0.5 rounded-full">{String(allCategories.length)}</span>
        </button>
      </div>

      {!showCategories ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 w-[150px] rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ALL">{"All Records"}</option>
              <option value="INCOME">{"Income"}</option>
              <option value="EXPENSE">{"Expenses"}</option>
            </select>
            <div className="flex gap-4 ml-auto text-sm">
              <span className="text-teal-500 font-medium tabular-nums">{"+₵" + totalIncome.toFixed(2) + " in"}</span>
              <span className="text-red-500 font-medium tabular-nums">{"-₵" + totalExpenses.toFixed(2) + " out"}</span>
            </div>
          </div>

          {/* Records table — plain HTML, no DataTable component */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 px-3">{"Date"}</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 px-3">{"Type"}</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 px-3">{"Category"}</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 px-3">{"Description"}</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 px-3">{"Account"}</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-9 px-3">{"Amount"}</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">{"No records found"}</td></tr>
                )}
                {filtered.map((f) => (
                  <tr key={ss(f.id)} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{f.date ? ss(formatDate(String(f.date))) : "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-medium border rounded-full px-2 py-0.5", ss(f.type) === "INCOME" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                        {ss(f.type) === "INCOME" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {ss(f.type)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium">{ss(f.category)}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{ss(f.description)}</td>
                    <td className="px-3 py-2.5">
                      <select value={ss(f.account_id)} onChange={async (e) => {
                        try { await updateFinanceRecord(ss(f.id), { account_id: e.target.value || null }); refetchRecords(); refetchAccounts(); } catch {}
                      }} className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none min-w-[110px]">
                        <option value="">{"—"}</option>
                        {activeAccounts.map((a) => <option key={ss(a.id)} value={ss(a.id)}>{ss(a.name)}</option>)}
                      </select>
                    </td>
                    <td className={cn("px-3 py-2.5 text-right font-semibold tabular-nums", ss(f.type) === "INCOME" ? "text-teal-500" : "text-red-600")}>
                      {(ss(f.type) === "INCOME" ? "+" : "-") + ss(formatCurrency(Number(f.amount)))}
                    </td>
                    <td className="px-1">
                      <Button variant="ghost" size="icon-xs" className="text-red-600" onClick={() => openDelete(ss(f.id), "record", ss(formatCurrency(Number(f.amount))))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ═══ CATEGORIES ═══ */
        <div className="space-y-5">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">{"New Category"}</Label>
              <Input value={ncName} onChange={(e) => setNcName(e.target.value)} placeholder="Category name" className="h-9" />
            </div>
            <select value={ncType} onChange={(e) => setNcType(e.target.value as "INCOME" | "EXPENSE")} className="h-9 w-[130px] rounded-md border border-input bg-background px-3 text-sm">
              <option value="INCOME">{"Income"}</option>
              <option value="EXPENSE">{"Expense"}</option>
            </select>
            <Button size="sm" onClick={handleAddCat} disabled={saving || !ncName.trim()} className="h-9 gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}{"Add"}
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {(["INCOME", "EXPENSE"] as const).map((catType) => {
              const cats = allCategories.filter((c) => ss(c.type) === catType);
              const isIncome = catType === "INCOME";
              return (
                <div key={catType} className="rounded-xl border border-border/60 bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    {isIncome ? <ArrowUpRight className="h-4 w-4 text-teal-500" /> : <ArrowDownRight className="h-4 w-4 text-red-500" />}
                    <h3 className="text-sm font-semibold">{isIncome ? "Income Categories" : "Expense Categories"}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">{String(cats.length)}</span>
                  </div>
                  <div className="space-y-1">
                    {cats.map((cat) => (
                      <div key={ss(cat.id)} className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/30 transition-colors group">
                        <Tag className={cn("h-3.5 w-3.5", isIncome ? "text-teal-500" : "text-red-500")} />
                        <span className={cn("text-sm flex-1", !cat.is_active && "text-muted-foreground line-through")}>{ss(cat.name)}</span>
                        <Button variant="ghost" size="icon-xs" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openDelete(ss(cat.id), "category", ss(cat.name))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {cats.length === 0 && <p className="text-xs text-muted-foreground py-2">{"No categories"}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ MODALS — only render when opened ═══ */}

      {modal === "addRecord" && (
        <SimpleModal open onClose={() => setModal("none")} title="New transaction" wide>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">{"Type"}<span className="text-red-500">*</span></Label>
                <select value={arType} onChange={(e) => { setArType(e.target.value); setArCat(""); }} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="INCOME">{"Income"}</option>
                  <option value="EXPENSE">{"Expense"}</option>
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">{"Category"}<span className="text-red-500">*</span></Label>
                <select value={arCat} onChange={(e) => setArCat(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">{"Select..."}</option>
                  {curCats.map((c) => <option key={ss(c.id)} value={ss(c.name)}>{ss(c.name)}</option>)}
                  <option value="__OTHER__">{"Other (new category)"}</option>
                </select>
              </div>
            </div>
            {arCat === "__OTHER__" && (
              <div>
                <Label className="text-xs mb-1 block">{"Custom Category"}<span className="text-red-500">*</span></Label>
                <Input value={arCustomCat} onChange={(e) => setArCustomCat(e.target.value)} placeholder="e.g. Tithe, Love Offering" className="h-9" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">{"Amount (₵)"}<span className="text-red-500">*</span></Label>
                <Input type="number" min={0} step={0.01} value={arAmt} onChange={(e) => setArAmt(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{"Account"}</Label>
                <select value={arAcct} onChange={(e) => setArAcct(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">{"-- No account --"}</option>
                  {activeAccounts.map((a) => <option key={ss(a.id)} value={ss(a.id)}>{ss(a.name) + " (" + ss(ACCOUNT_TYPE_LABELS[ss(a.type)] || a.type) + ")"}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">{"Date"}<span className="text-red-500">*</span></Label>
                <Input type="date" value={arDate} onChange={(e) => setArDate(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{"Payment Method"}</Label>
                <select value={arMethod} onChange={(e) => setArMethod(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">{"Select..."}</option>
                  <option value="CASH">{"Cash"}</option>
                  <option value="MOBILE_MONEY">{"Mobile Money"}</option>
                  <option value="BANK_TRANSFER">{"Bank Transfer"}</option>
                  <option value="CHEQUE">{"Cheque"}</option>
                  <option value="PAYSTACK">{"Paystack"}</option>
                  <option value="OTHER">{"Other"}</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">{"Description"}<span className="text-red-500">*</span></Label>
              <Textarea value={arDesc} onChange={(e) => setArDesc(e.target.value)} placeholder="Describe the transaction" rows={2} />
            </div>
            {arErr && <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{arErr}</div>}
            <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
              <Button variant="outline" onClick={() => setModal("none")} disabled={saving}>{"Cancel"}</Button>
              <Button onClick={handleAddRecord} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Saving..."}</> : "Add Record"}
              </Button>
            </div>
          </div>
        </SimpleModal>
      )}

      {modal === "addAccount" && (
        <SimpleModal open onClose={() => setModal("none")} title="New account" wide>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">{"Account Name"}<span className="text-red-500">*</span></Label><Input value={aaName} onChange={(e) => setAaName(e.target.value)} placeholder="e.g. MTN MoMo" className="h-9" /></div>
              <div><Label className="text-xs mb-1 block">{"Type"}<span className="text-red-500">*</span></Label>
                <select value={aaType} onChange={(e) => setAaType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">{"Provider / Bank"}</Label><Input value={aaProvider} onChange={(e) => setAaProvider(e.target.value)} placeholder="e.g. MTN, GCB" className="h-9" /></div>
              <div><Label className="text-xs mb-1 block">{"Account Number"}</Label><Input value={aaNumber} onChange={(e) => setAaNumber(e.target.value)} placeholder="e.g. 023-XXX" className="h-9" /></div>
            </div>
            <div><Label className="text-xs mb-1 block">{"Opening Balance (₵)"}</Label><Input type="number" min={0} step={0.01} value={aaBal} onChange={(e) => setAaBal(e.target.value)} className="h-9" /></div>
            <div><Label className="text-xs mb-1 block">{"Notes"}</Label><Textarea value={aaNotes} onChange={(e) => setAaNotes(e.target.value)} rows={2} /></div>
            {aaErr && <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{aaErr}</div>}
            <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
              <Button variant="outline" onClick={() => setModal("none")} disabled={saving}>{"Cancel"}</Button>
              <Button onClick={handleAddAccount} disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Saving..."}</> : "Create Account"}</Button>
            </div>
          </div>
        </SimpleModal>
      )}

      {modal === "editAccount" && editAccountData && (
        <SimpleModal open onClose={() => { setModal("none"); setEditAccountData(null); }} title={"Edit " + ss(editAccountData.name)} wide>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">{"Account Name"}<span className="text-red-500">*</span></Label><Input value={aaName} onChange={(e) => setAaName(e.target.value)} className="h-9" /></div>
              <div><Label className="text-xs mb-1 block">{"Type"}<span className="text-red-500">*</span></Label>
                <select value={aaType} onChange={(e) => setAaType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">{"Provider"}</Label><Input value={aaProvider} onChange={(e) => setAaProvider(e.target.value)} className="h-9" /></div>
              <div><Label className="text-xs mb-1 block">{"Account Number"}</Label><Input value={aaNumber} onChange={(e) => setAaNumber(e.target.value)} className="h-9" /></div>
            </div>
            <div><Label className="text-xs mb-1 block">{"Balance (₵)"}</Label><Input type="number" step={0.01} value={aaBal} onChange={(e) => setAaBal(e.target.value)} className="h-9" /></div>
            <div><Label className="text-xs mb-1 block">{"Notes"}</Label><Textarea value={aaNotes} onChange={(e) => setAaNotes(e.target.value)} rows={2} /></div>
            {aaErr && <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{aaErr}</div>}
            <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
              <Button variant="outline" onClick={() => { setModal("none"); setEditAccountData(null); }} disabled={saving}>{"Cancel"}</Button>
              <Button onClick={handleEditAccount} disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Saving..."}</> : "Update"}</Button>
            </div>
          </div>
        </SimpleModal>
      )}

      {modal === "transfer" && (
        <SimpleModal open onClose={() => setModal("none")} title="Transfer between accounts">
          <div className="space-y-4">
            <div><Label className="text-xs font-medium mb-1 block">{"From"}</Label>
              <select value={txFrom} onChange={(e) => setTxFrom(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">{"Choose account…"}</option>
                {activeAccounts.map((a) => <option key={ss(a.id)} value={ss(a.id)}>{ss(a.name) + " — " + ss(formatCurrency(Number(a.balance)))}</option>)}
              </select>
            </div>
            <div><Label className="text-xs font-medium mb-1 block">{"To"}</Label>
              <select value={txTo} onChange={(e) => setTxTo(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">{"Choose account…"}</option>
                {activeAccounts.filter((a) => ss(a.id) !== txFrom).map((a) => <option key={ss(a.id)} value={ss(a.id)}>{ss(a.name) + " — " + ss(formatCurrency(Number(a.balance)))}</option>)}
              </select>
            </div>
            <div><Label className="text-xs font-medium mb-1 block">{"Amount (₵)"}</Label>
              <Input type="number" min={0} step={0.01} value={txAmt} onChange={(e) => setTxAmt(e.target.value)} className="h-10" />
            </div>
            <div><Label className="text-xs font-medium mb-1 block">{"Note (optional)"}</Label>
              <Input value={txNote} onChange={(e) => setTxNote(e.target.value)} placeholder="e.g. move offering to savings" className="h-10" />
            </div>
            {txErr && <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{txErr}</div>}
            <Button onClick={handleTransfer} disabled={saving} className="w-full h-10">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Transferring…"}</> : "Record transfer"}
            </Button>
          </div>
        </SimpleModal>
      )}

      {modal === "delete" && deleteTarget && (
        <SimpleModal open onClose={() => { setModal("none"); setDeleteTarget(null); }} title={"Delete " + ss(deleteTarget.type)}>
          <div className="flex items-start gap-3 text-sm mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p>{"Delete "}<strong>{ss(deleteTarget.label)}</strong>{"? This cannot be undone."}</p>
          </div>
          <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
            <Button variant="outline" onClick={() => { setModal("none"); setDeleteTarget(null); }} disabled={saving}>{"Cancel"}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{"Deleting…"}</> : "Delete"}
            </Button>
          </div>
        </SimpleModal>
      )}
    </div>
  );
}
