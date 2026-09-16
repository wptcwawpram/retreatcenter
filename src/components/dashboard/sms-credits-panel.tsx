"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MessageSquare, Loader2, Plus, AlertTriangle, TrendingUp, TrendingDown, History } from "lucide-react";

type Txn = {
  id: string;
  type: "PURCHASE" | "USAGE" | "ADJUSTMENT";
  credits: number;
  balance_after: number;
  description: string | null;
  reference: string | null;
  amount_paid: number | null;
  recipient: string | null;
  created_at: string;
};

const PACKAGES = [100, 500, 1000, 2000];

export function SmsCreditsPanel({ adminEmail }: { adminEmail?: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [price, setPrice] = useState(0.1);
  const [lowThreshold, setLowThreshold] = useState(50);
  const [purchaseConfigured, setPurchaseConfigured] = useState(true);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [showBuy, setShowBuy] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/sms-credits");
      if (!res.ok) return;
      const d = await res.json();
      setBalance(Number(d.balance) || 0);
      setPrice(Number(d.price) || 0.1);
      setLowThreshold(Number(d.lowThreshold) || 50);
      setPurchaseConfigured(!!d.purchaseConfigured);
      setTransactions(d.transactions || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const isLow = balance !== null && balance <= lowThreshold;
  const isEmpty = balance !== null && balance <= 0;

  return (
    <div className={cn(
      "rounded-xl border p-4 mb-4",
      isEmpty ? "border-red-500/30 bg-red-500/5" : isLow ? "border-amber-500/30 bg-amber-500/5" : "border-border/60 bg-card",
    )}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg",
            isEmpty ? "bg-red-500/10 text-red-500" : isLow ? "bg-amber-500/10 text-amber-500" : "bg-sidebar-primary/10 text-sidebar-primary",
          )}>
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">SMS Credits</p>
            <p className="text-2xl font-bold tabular-nums leading-none mt-0.5">
              {balance === null ? "…" : Math.floor(balance).toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">credits</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAudit(true)}>
            <History className="h-3.5 w-3.5" />Audit
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setShowBuy(true)}>
            <Plus className="h-3.5 w-3.5" />Buy Credits
          </Button>
        </div>
      </div>

      {isEmpty && (
        <div className="flex items-start gap-2 mt-3 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Out of credits — automated texts (booking confirmations, reminders, bulk sends) are paused. Login codes still work. Buy credits to resume.</p>
        </div>
      )}
      {isLow && !isEmpty && (
        <div className="flex items-start gap-2 mt-3 text-sm text-amber-500">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Running low ({Math.floor(balance!)} left). Top up soon to avoid interruped texts.</p>
        </div>
      )}

      {showBuy && (
        <BuyDialog
          price={price}
          adminEmail={adminEmail}
          purchaseConfigured={purchaseConfigured}
          onClose={() => setShowBuy(false)}
          onDone={() => { setShowBuy(false); load(); }}
        />
      )}

      {showAudit && (
        <AuditDialog transactions={transactions} onClose={() => setShowAudit(false)} />
      )}
    </div>
  );
}

function BuyDialog({ price, adminEmail, purchaseConfigured, onClose, onDone }: {
  price: number; adminEmail?: string; purchaseConfigured: boolean; onClose: () => void; onDone: () => void;
}) {
  const [credits, setCredits] = useState<number>(500);
  const [email, setEmail] = useState(adminEmail || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState(false);

  const amount = credits * price;

  const handleBuy = async () => {
    if (!email) { setError("Enter an email for the receipt."); return; }
    if (credits <= 0) { setError("Choose how many credits to buy."); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/sms-credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, credits }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to start payment");

      const win = window.open(d.authorization_url, "_blank");
      if (!win) { setError("Allow pop-ups, then try again."); setBusy(false); return; }

      // Poll verification until success (or timeout ~3 min)
      setWaiting(true);
      const reference = d.reference as string;
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const vr = await fetch("/api/sms-credits/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference }),
          });
          const vd = await vr.json();
          if (vr.ok && vd.success) {
            clearInterval(poll);
            toast.success(`${credits} credits added`);
            onDone();
          }
        } catch {}
        if (attempts >= 45) { clearInterval(poll); setWaiting(false); setBusy(false); setError("Still waiting on payment. If you paid, click Buy Credits again to refresh — it won't double-charge."); }
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy SMS Credits</DialogTitle>
          <DialogDescription>1 credit = 1 SMS (160 chars). Longer messages use more.</DialogDescription>
        </DialogHeader>

        {!purchaseConfigured ? (
          <div className="flex items-start gap-2 text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Purchases aren&apos;t set up yet. The owner needs to add the <strong>SMS_PAYSTACK_SECRET_KEY</strong> environment variable.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {PACKAGES.map((p) => (
                <button key={p} type="button" onClick={() => setCredits(p)}
                  className={cn(
                    "rounded-lg border-2 py-2 text-center transition-all",
                    credits === p ? "border-sidebar-primary bg-sidebar-primary/10" : "border-border hover:border-sidebar-primary/40",
                  )}>
                  <p className="text-sm font-bold">{p}</p>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(p * price)}</p>
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Or enter an amount</Label>
              <Input type="number" min="1" value={credits} onChange={(e) => setCredits(Math.floor(Number(e.target.value) || 0))} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Receipt email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-9" />
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border/40">
              <span>{credits.toLocaleString()} credits</span>
              <span className="text-sidebar-primary">{formatCurrency(amount)}</span>
            </div>
            {waiting && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />Waiting for payment confirmation… complete it in the new tab.
              </div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Close</Button>
          {purchaseConfigured && (
            <Button onClick={handleBuy} disabled={busy}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Processing…</> : `Pay ${formatCurrency(amount)}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AuditDialog({ transactions, onClose }: { transactions: Txn[]; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SMS Credit Audit</DialogTitle>
          <DialogDescription>Every purchase and every SMS sent.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          {transactions.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No activity yet.</p>}
          {transactions.map((t) => {
            const positive = Number(t.credits) >= 0;
            return (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-md shrink-0", positive ? "bg-teal-500/10 text-teal-500" : "bg-muted text-muted-foreground")}>
                    {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{t.description || t.type}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(t.created_at)}{t.recipient ? ` • ${t.recipient}` : ""}{t.amount_paid ? ` • ${formatCurrency(Number(t.amount_paid))}` : ""}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-sm font-bold tabular-nums", positive ? "text-teal-500" : "text-muted-foreground")}>{positive ? "+" : ""}{Number(t.credits)}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">bal {Math.floor(Number(t.balance_after))}</p>
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
