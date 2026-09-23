"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Wallet, AlertTriangle, Save, Link2, Copy, TrendingDown, TrendingUp } from "lucide-react";

type Ledger = { id: string; type: string; amount: number; segments: number | null; source: string | null; description: string | null; balance_after: number; created_at: string };

export default function HubtelAdminPage() {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [newCredits, setNewCredits] = useState("");
  const [savingCredits, setSavingCredits] = useState(false);
  const [costPerSms, setCostPerSms] = useState("0.03");
  const [alertNumbers, setAlertNumbers] = useState("");
  const [reportSecretSet, setReportSecretSet] = useState(false);
  const [ledger, setLedger] = useState<Ledger[]>([]);
  const [newBalance, setNewBalance] = useState("");
  const [savingBal, setSavingBal] = useState(false);
  const [savingCfg, setSavingCfg] = useState(false);
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/hubtel");
      if (res.status === 404 || res.status === 401) { setNotFound(true); return; }
      const d = await res.json();
      setBalance(d.balance);
      setCreditBalance(d.creditBalance ?? null);
      setCostPerSms(String(d.costPerSms ?? "0.03"));
      setAlertNumbers(d.alertNumbers || "");
      setReportSecretSet(!!d.reportSecretSet);
      setLedger(d.ledger || []);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { setOrigin(window.location.origin); load(); }, [load]);

  const saveBalance = async () => {
    const b = Number(newBalance);
    if (Number.isNaN(b)) { toast.error("Enter a valid amount"); return; }
    setSavingBal(true);
    try {
      const res = await fetch("/api/hubtel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set_balance", balance: b, note: "Balance updated after Hubtel top-up" }) });
      if (!res.ok) throw new Error();
      toast.success("Balance updated");
      setNewBalance("");
      load();
    } catch { toast.error("Failed to update balance"); }
    finally { setSavingBal(false); }
  };

  const setCredits = async (mode: "set" | "grant") => {
    const v = Number(newCredits);
    if (Number.isNaN(v)) { toast.error("Enter a number"); return; }
    setSavingCredits(true);
    try {
      const res = await fetch("/api/hubtel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode === "set" ? "set_credits" : "grant_credits", credits: v }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCreditBalance(d.creditBalance);
      setNewCredits("");
      toast.success(mode === "set" ? `Credit balance set to ${d.creditBalance}` : `Granted ${v} credits`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSavingCredits(false); }
  };

  const saveConfig = async () => {
    setSavingCfg(true);
    try {
      const res = await fetch("/api/hubtel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "config", cost_per_sms: Number(costPerSms), alert_numbers: alertNumbers }) });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
      load();
    } catch { toast.error("Failed to save settings"); }
    finally { setSavingCfg(false); }
  };

  const snippet = `// In the OTHER project, after each successful sendSms():
await fetch("${origin}/api/hubtel/usage", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-hubtel-secret": process.env.HUBTEL_USAGE_SECRET, // same secret as this app
  },
  body: JSON.stringify({ segments: 1, source: "other-project" }),
}).catch(() => {});`;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <p className="text-5xl font-bold">404</p>
      <p className="text-sm text-muted-foreground mt-2">This page could not be found.</p>
    </div>
  );

  const low = balance !== null && balance <= 20;
  const critical = balance !== null && balance <= 5;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary"><Wallet className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl font-bold">Hubtel Balance</h1>
            <p className="text-xs text-muted-foreground">Superadmin only · manual balance tracker</p>
          </div>
        </div>

        {/* Balance card */}
        <div className={cn("rounded-2xl border p-5", critical ? "border-red-500/30 bg-red-500/5" : low ? "border-amber-500/30 bg-amber-500/5" : "border-border/60 bg-card")}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated remaining balance</p>
          <p className={cn("text-4xl font-bold tabular-nums mt-1", critical ? "text-red-400" : low ? "text-amber-500" : "text-foreground")}>
            {balance === null ? "Not set" : `GH₵${balance.toFixed(2)}`}
          </p>
          {low && <p className="text-sm mt-2 flex items-center gap-1.5 text-amber-500"><AlertTriangle className="h-4 w-4" />Running low — top up your Hubtel account.</p>}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Set current balance (after topping up Hubtel)</Label>
              <Input type="number" step="0.01" placeholder="e.g. 100.00" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} className="h-9" />
            </div>
            <Button onClick={saveBalance} disabled={savingBal} className="gap-1.5">
              {savingBal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Update balance
            </Button>
          </div>
        </div>

        {/* SMS credits grant (in-app resold credits, separate from Hubtel wallet) */}
        <div className={cn("rounded-2xl border p-5 space-y-3", (creditBalance ?? 0) < 0 ? "border-red-500/30 bg-red-500/5" : "border-border/60 bg-card")}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">SMS Credits (admin grant)</h2>
            <span className={cn("text-lg font-bold tabular-nums", (creditBalance ?? 0) < 0 ? "text-red-400" : (creditBalance ?? 0) <= 50 ? "text-amber-500" : "text-foreground")}>
              {creditBalance === null ? "…" : Math.floor(creditBalance).toLocaleString()} credits
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Grant credits to admins without a payment - e.g. to cancel out a negative balance from the alert bug. Set a target or add an amount.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Amount</Label>
              <Input type="number" step="1" placeholder="e.g. 0 to reset, or 500" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} className="h-9" />
            </div>
            <Button variant="outline" onClick={() => setCredits("set")} disabled={savingCredits} className="gap-1.5">
              {savingCredits ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Set balance to
            </Button>
            <Button onClick={() => setCredits("grant")} disabled={savingCredits} className="gap-1.5">
              {savingCredits ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}Grant (add)
            </Button>
          </div>
        </div>

        {/* Config */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cost per SMS segment (GH₵)</Label>
              <Input type="number" step="0.001" value={costPerSms} onChange={(e) => setCostPerSms(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Alert numbers (comma separated)</Label>
              <Input value={alertNumbers} onChange={(e) => setAlertNumbers(e.target.value)} placeholder="0552399981, 024 000 0000" className="h-9" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Alerts are sent by SMS at GH₵20, 10, 5 and 2. They re-arm after you top up.</p>
          <Button onClick={saveConfig} disabled={savingCfg} variant="outline" size="sm" className="gap-1.5">
            {savingCfg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save settings
          </Button>
        </div>

        {/* Linked project integration */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Link2 className="h-4 w-4 text-sidebar-primary" />Linked project reporting</h2>
          <p className="text-xs text-muted-foreground">
            Set the same <code className="text-foreground">HUBTEL_USAGE_SECRET</code> env var in both projects, then add this after each SMS the other project sends so its usage deducts here too.
            {reportSecretSet
              ? <span className="text-teal-500"> Secret is set on this app ✓</span>
              : <span className="text-amber-500"> HUBTEL_USAGE_SECRET is not set on this app yet.</span>}
          </p>
          <div className="relative">
            <pre className="text-[11px] bg-muted/40 border border-border/60 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">{snippet}</pre>
            <Button variant="outline" size="icon-xs" className="absolute top-2 right-2" onClick={() => { navigator.clipboard?.writeText(snippet); toast.success("Copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        {/* Ledger */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold">Activity</h2>
          {ledger.length === 0 && <p className="text-sm text-muted-foreground py-2">No activity yet.</p>}
          <div className="space-y-1.5">
            {ledger.map((l) => {
              const positive = Number(l.amount) >= 0;
              return (
                <div key={l.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-md shrink-0", positive ? "bg-teal-500/10 text-teal-500" : "bg-muted text-muted-foreground")}>
                      {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{l.description || l.type}{l.source ? ` · ${l.source}` : ""}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(l.created_at)} {formatTime(l.created_at)}{l.segments ? ` · ${l.segments} seg` : ""}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-bold tabular-nums", positive ? "text-teal-500" : "text-muted-foreground")}>{positive ? "+" : ""}GH₵{Math.abs(Number(l.amount)).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">bal GH₵{Number(l.balance_after).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
