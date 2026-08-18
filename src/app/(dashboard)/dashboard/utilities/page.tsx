"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadCSV } from "@/lib/export-csv";
import { cn } from "@/lib/utils";
import {
  Zap, Droplets, Fuel, Download, Plus, Trash2, Loader2,
  AlertCircle, CheckCircle, AlertTriangle, X,
} from "lucide-react";

interface UtilityLog {
  id: string;
  utility_type: string;
  event_type: string;
  reading_value: number | null;
  description: string | null;
  created_at: string;
}

interface UtilityStatus {
  utility_type: string;
  status: string;
  current_reading: number | null;
  last_event: string | null;
  last_event_at: string | null;
}

const UTILITY_META: Record<string, { label: string; icon: typeof Zap; iconBg: string }> = {
  POWER: { label: "Power (ECG)", icon: Zap, iconBg: "bg-teal-500/10 text-teal-500" },
  GENERATOR: { label: "Generator", icon: Fuel, iconBg: "bg-amber-500/10 text-amber-600" },
  WATER: { label: "Water Supply", icon: Droplets, iconBg: "bg-blue-500/10 text-blue-600" },
};

const EVENT_TYPES: Record<string, { label: string; value: string }[]> = {
  POWER: [
    { label: "Outage started", value: "OUTAGE_START" },
    { label: "Power restored", value: "OUTAGE_END" },
    { label: "Note", value: "NOTE" },
  ],
  GENERATOR: [
    { label: "Generator started", value: "GENERATOR_START" },
    { label: "Generator stopped", value: "GENERATOR_STOP" },
    { label: "Fuel level reading", value: "FUEL_READING" },
    { label: "Maintenance", value: "MAINTENANCE" },
    { label: "Note", value: "NOTE" },
  ],
  WATER: [
    { label: "Tank level reading", value: "WATER_READING" },
    { label: "Tank refilled", value: "WATER_REFILL" },
    { label: "Maintenance", value: "MAINTENANCE" },
    { label: "Note", value: "NOTE" },
  ],
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  NORMAL: { bg: "bg-teal-500/10 border-teal-500/20", text: "text-teal-400", dot: "bg-teal-400" },
  OUTAGE: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", dot: "bg-red-400" },
  RUNNING: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  STANDBY: { bg: "bg-muted/30 border-border", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  LOW: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  CRITICAL: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", dot: "bg-red-400" },
};

const EVENT_DOT: Record<string, string> = {
  OUTAGE_START: "bg-red-400",
  OUTAGE_END: "bg-teal-400",
  GENERATOR_START: "bg-amber-400",
  GENERATOR_STOP: "bg-muted-foreground",
  FUEL_READING: "bg-amber-400",
  WATER_READING: "bg-blue-400",
  WATER_REFILL: "bg-blue-400",
  MAINTENANCE: "bg-purple-400",
  NOTE: "bg-muted-foreground",
};

function formatDt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function UtilitiesPage() {
  const [logs, setLogs] = useState<UtilityLog[]>([]);
  const [statuses, setStatuses] = useState<UtilityStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fType, setFType] = useState("POWER");
  const [fEvent, setFEvent] = useState("");
  const [fReading, setFReading] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fErr, setFErr] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/utilities");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStatuses(data.statuses || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!fEvent) { setFErr("Select an event type"); return; }
    const needsReading = ["FUEL_READING", "WATER_READING", "WATER_REFILL"].includes(fEvent);
    if (needsReading && !fReading) { setFErr("Enter a reading value (0-100%)"); return; }
    setSaving(true); setFErr("");
    try {
      const res = await fetch("/api/utilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utility_type: fType,
          event_type: fEvent,
          reading_value: fReading ? Number(fReading) : null,
          description: fDesc || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFErr(data.error || "Failed"); return; }
      setShowForm(false); setFEvent(""); setFReading(""); setFDesc("");
      fetchData();
    } catch { setFErr("Network error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/utilities?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch {}
  };

  const handleExport = () => {
    downloadCSV("utility-logs", ["Date", "Utility", "Event", "Reading", "Description"], logs.map((l) => [
      formatDt(l.created_at), l.utility_type, l.event_type,
      l.reading_value !== null ? `${l.reading_value}%` : "", l.description || "",
    ]));
  };

  const getStatus = (type: string) => statuses.find((s) => s.utility_type === type);

  // Count outages this month for power
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const powerOutagesThisMonth = logs.filter((l) => l.utility_type === "POWER" && l.event_type === "OUTAGE_START" && l.created_at >= monthStart).length;
  const genHoursThisMonth = (() => {
    const genLogs = logs.filter((l) => l.utility_type === "GENERATOR" && (l.event_type === "GENERATOR_START" || l.event_type === "GENERATOR_STOP") && l.created_at >= monthStart).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let totalMs = 0;
    for (let i = 0; i < genLogs.length; i++) {
      if (genLogs[i].event_type === "GENERATOR_START") {
        const stop = genLogs.find((l, j) => j > i && l.event_type === "GENERATOR_STOP");
        if (stop) totalMs += new Date(stop.created_at).getTime() - new Date(genLogs[i].created_at).getTime();
      }
    }
    return Math.round(totalMs / 3600000);
  })();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Utilities" description="Track power, water, and generator status for the compound">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />Export CSV
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => { setShowForm(true); setFType("POWER"); setFEvent(""); setFReading(""); setFDesc(""); setFErr(""); }}>
            <Plus className="h-3.5 w-3.5" />Log Event
          </Button>
        </div>
      </PageHeader>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["POWER", "GENERATOR", "WATER"] as const).map((type) => {
          const meta = UTILITY_META[type];
          const Icon = meta.icon;
          const st = getStatus(type);
          const style = STATUS_STYLES[st?.status || "NORMAL"] || STATUS_STYLES.NORMAL;
          return (
            <div key={type} className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-md hover:shadow-black/[0.03] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2.5 rounded-xl", meta.iconBg)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{meta.label}</h3>
                  <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-medium border rounded-full px-2 py-0.5 mt-1", style.bg, style.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                    {st?.status || "NORMAL"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {type === "POWER" && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Outages this month</span>
                      <span className="font-bold">{powerOutagesThisMonth}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Last event</span>
                      <span>{st?.last_event_at ? formatDt(st.last_event_at) : "—"}</span>
                    </div>
                  </>
                )}
                {type === "GENERATOR" && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Fuel level</span>
                      <span className={cn("font-bold", (st?.current_reading ?? 100) <= 30 ? "text-red-500" : "")}>
                        {st?.current_reading !== null && st?.current_reading !== undefined ? `${st.current_reading}%` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Run hours this month</span>
                      <span className="font-bold">{genHoursThisMonth}h</span>
                    </div>
                  </>
                )}
                {type === "WATER" && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tank level</span>
                      <span className={cn("font-bold", (st?.current_reading ?? 100) <= 30 ? "text-red-500" : "")}>
                        {st?.current_reading !== null && st?.current_reading !== undefined ? `${st.current_reading}%` : "—"}
                      </span>
                    </div>
                    {st?.current_reading !== null && st?.current_reading !== undefined && (
                      <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", st.current_reading <= 20 ? "bg-red-500" : st.current_reading <= 40 ? "bg-amber-500" : "bg-blue-500")}
                          style={{ width: `${Math.min(100, st.current_reading)}%` }}
                        />
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last update</span>
                  <span className="text-[11px]">{st?.last_event_at ? formatDt(st.last_event_at) : "—"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Logs */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Event Log</h3>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border/60 rounded-xl">
            No utility events logged yet. Click "Log Event" to record power outages, generator runs, or water levels.
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log) => {
              const meta = UTILITY_META[log.utility_type];
              return (
                <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0 group">
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", EVENT_DOT[log.event_type] || "bg-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {log.event_type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                    <span className={cn("text-[10px] font-medium border rounded-full px-1.5 py-0.5 ml-2", meta?.iconBg || "bg-muted/30")}>
                      {meta?.label || log.utility_type}
                    </span>
                    {log.reading_value !== null && (
                      <span className="text-xs font-bold ml-2">{log.reading_value}%</span>
                    )}
                    {log.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{log.description}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{formatDt(log.created_at)}</span>
                  <Button variant="ghost" size="icon-xs" className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => handleDelete(log.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative z-10 w-full max-w-[calc(100%-2rem)] sm:max-w-md rounded-xl bg-popover p-5 text-sm text-popover-foreground ring-1 ring-foreground/10 shadow-xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-semibold">Log Utility Event</h2>
              <button onClick={() => setShowForm(false)} className="rounded-md p-1 hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Utility<span className="text-red-500">*</span></Label>
                <select value={fType} onChange={(e) => { setFType(e.target.value); setFEvent(""); }} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="POWER">Power (ECG)</option>
                  <option value="GENERATOR">Generator</option>
                  <option value="WATER">Water Supply</option>
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Event<span className="text-red-500">*</span></Label>
                <select value={fEvent} onChange={(e) => setFEvent(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select event...</option>
                  {(EVENT_TYPES[fType] || []).map((ev) => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
                </select>
              </div>
              {["FUEL_READING", "WATER_READING", "WATER_REFILL"].includes(fEvent) && (
                <div>
                  <Label className="text-xs mb-1 block">Reading (%)<span className="text-red-500">*</span></Label>
                  <Input type="number" min={0} max={100} value={fReading} onChange={(e) => setFReading(e.target.value)} className="h-9" />
                </div>
              )}
              <div>
                <Label className="text-xs mb-1 block">Notes</Label>
                <Input value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Optional description" className="h-9" />
              </div>
              {fErr && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{fErr}
                </div>
              )}
              <div className="-mx-5 -mb-5 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
                <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : "Log Event"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
