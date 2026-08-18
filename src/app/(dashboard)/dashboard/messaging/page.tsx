"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { downloadCSV } from "@/lib/export-csv";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Send, Phone, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw,
  MessageSquare, Clock, FileText, Users, Upload, Download, X, Trash2,
  UserCheck, LogIn, LogOut, History,
} from "lucide-react";

interface Message {
  id: string;
  to_phone: string;
  recipient_name: string | null;
  channel: string;
  subject: string | null;
  body: string;
  status: string;
  error: string | null;
  created_at: string;
}

interface Recipient {
  name: string;
  phone: string;
}

const SEGMENTS = [
  { value: "all_guests", label: "All Guests", icon: Users, desc: "Every guest in the system" },
  { value: "current_guests", label: "Current Guests", icon: UserCheck, desc: "Currently checked in" },
  { value: "checking_in_today", label: "Checking In Today", icon: LogIn, desc: "Arriving today" },
  { value: "checking_in_tomorrow", label: "Checking In Tomorrow", icon: LogIn, desc: "Arriving tomorrow" },
  { value: "checking_out_today", label: "Checking Out Today", icon: LogOut, desc: "Departing today" },
  { value: "checking_out_tomorrow", label: "Checking Out Tomorrow", icon: LogOut, desc: "Departing tomorrow" },
  { value: "past_guests", label: "Past Guests", icon: History, desc: "Previously checked out" },
  { value: "employees", label: "Employees", icon: Users, desc: "Active staff members" },
];

const TEMPLATES = [
  { name: "Booking Confirmation", body: "Dear {guest}, your booking at Warriors Prayer Tower Complex is confirmed. Check-in: {date}. God bless you!" },
  { name: "Payment Receipt", body: "Dear {guest}, we have received your payment of GH₵{amount} for your booking. Thank you! - WPTC" },
  { name: "Check-in Reminder", body: "Dear {guest}, this is a reminder that your check-in at Warriors Prayer Tower Complex is tomorrow. We look forward to welcoming you!" },
  { name: "Check-out Reminder", body: "Dear {guest}, your check-out from Warriors Prayer Tower Complex is tomorrow. We hope you enjoyed your stay. God bless!" },
  { name: "Thank You", body: "Dear {guest}, thank you for staying at Warriors Prayer Tower Complex. We hope you had a blessed time. God bless you!" },
  { name: "General Announcement", body: "Dear {guest}, {message}. God bless you! - Warriors Prayer Tower Complex" },
];

export default function MessagingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeTab, setActiveTab] = useState<"compose" | "bulk" | "history" | "templates" | "contacts">("compose");

  // Single compose
  const [toPhone, setToPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Bulk send
  const [bulkRecipients, setBulkRecipients] = useState<Recipient[]>([]);
  const [bulkSegment, setBulkSegment] = useState("");
  const [bulkMsg, setBulkMsg] = useState("");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  // CSV upload
  const [manualContacts, setManualContacts] = useState<Recipient[]>([]);
  const [addPhone, setAddPhone] = useState("");
  const [addName, setAddName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      }
    } catch {}
    finally { setLoadingMessages(false); }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSingleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toPhone || !msgBody) return;
    setSending(true); setSendResult(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toPhone, recipient_name: recipientName, subject, message: msgBody }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, message: "SMS sent successfully!" });
        setToPhone(""); setRecipientName(""); setSubject(""); setMsgBody("");
        fetchMessages();
      } else {
        setSendResult({ success: false, message: data.error || "Failed to send SMS" });
      }
    } catch {
      setSendResult({ success: false, message: "Network error" });
    } finally { setSending(false); }
  };

  const loadSegment = async (seg: string) => {
    setBulkSegment(seg); setBulkLoading(true); setBulkResult(null);
    try {
      const res = await fetch(`/api/messages/recipients?segment=${seg}`);
      const data = await res.json();
      setBulkRecipients(data.recipients || []);
    } catch {
      setBulkRecipients([]);
    } finally { setBulkLoading(false); }
  };

  const handleBulkSend = async () => {
    const allRecipients = [...bulkRecipients, ...manualContacts];
    if (allRecipients.length === 0 || !bulkMsg) return;
    setBulkSending(true); setBulkResult(null);
    try {
      const res = await fetch("/api/messages/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: allRecipients, message: bulkMsg, subject: bulkSubject }),
      });
      const data = await res.json();
      setBulkResult({ total: data.total || 0, sent: data.sent || 0, failed: data.failed || 0 });
      fetchMessages();
    } catch {
      setBulkResult({ total: 0, sent: 0, failed: allRecipients.length });
    } finally { setBulkSending(false); }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const contacts: Recipient[] = [];
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (i === 0 && (parts[0].toLowerCase().includes("name") || parts[0].toLowerCase().includes("phone"))) continue;
        if (parts.length >= 2) {
          const hasDigits = (s: string) => /\d{7,}/.test(s.replace(/\D/g, ""));
          if (hasDigits(parts[0])) {
            contacts.push({ phone: parts[0], name: parts[1] || "" });
          } else {
            contacts.push({ name: parts[0], phone: parts[1] });
          }
        } else if (parts.length === 1 && /\d{7,}/.test(parts[0].replace(/\D/g, ""))) {
          contacts.push({ phone: parts[0], name: "" });
        }
      }
      setManualContacts((prev) => [...prev, ...contacts]);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addManualContact = () => {
    if (!addPhone) return;
    setManualContacts((prev) => [...prev, { name: addName, phone: addPhone }]);
    setAddPhone(""); setAddName("");
  };

  const removeManualContact = (i: number) => {
    setManualContacts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const useTemplate = (t: typeof TEMPLATES[number]) => {
    if (activeTab === "bulk") {
      setBulkMsg(t.body);
      setBulkSubject(t.name);
    } else {
      setMsgBody(t.body);
      setSubject(t.name);
      setActiveTab("compose");
    }
  };

  const handleExport = () => {
    downloadCSV("message-history", ["Date", "To", "Name", "Subject", "Message", "Status"], messages.map((m) => [
      m.created_at ? formatDate(m.created_at) : "", m.to_phone, m.recipient_name || "",
      m.subject || "", m.body, m.status,
    ]));
  };

  const totalRecipients = bulkRecipients.length + manualContacts.length;

  const tabs = [
    { key: "compose" as const, label: "Compose", icon: Send },
    { key: "bulk" as const, label: "Bulk Send", icon: Users },
    { key: "contacts" as const, label: `Contacts${manualContacts.length > 0 ? ` (${manualContacts.length})` : ""}`, icon: Upload },
    { key: "history" as const, label: `History${messages.length > 0 ? ` (${messages.length})` : ""}`, icon: Clock },
    { key: "templates" as const, label: "Templates", icon: FileText },
  ];

  const columns: Column<Message>[] = [
    { header: "Date", accessor: (m) => <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span> },
    { header: "To", accessor: (m) => (
      <div>
        {m.recipient_name && <p className="font-medium text-sm">{m.recipient_name}</p>}
        <p className="text-[11px] text-muted-foreground">{m.to_phone}</p>
      </div>
    )},
    { header: "Subject", accessor: (m) => <span className="text-xs">{m.subject || "—"}</span> },
    { header: "Message", accessor: (m) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] block">{m.body}</span> },
    { header: "Status", accessor: (m) => (
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", m.status === "SENT" ? "bg-teal-400" : "bg-red-400")} />
        <span className={cn("text-xs font-medium", m.status === "SENT" ? "text-teal-400" : "text-red-700")}>{m.status}</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Messaging" description="Send SMS to guests, employees, and custom contacts — single or bulk">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />Export History
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-border/60 pb-0 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px whitespace-nowrap",
                activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ── SINGLE COMPOSE ── */}
      {activeTab === "compose" && (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <form onSubmit={handleSingleSend} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Phone Number <span className="text-red-500">*</span></Label>
                <Input type="tel" placeholder="+233 XXX XXX XXX" value={toPhone} onChange={(e) => setToPhone(e.target.value)} className="h-9" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Recipient Name</Label>
                <Input placeholder="Guest name (optional)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Input placeholder="Message subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message <span className="text-red-500">*</span></Label>
              <Textarea placeholder="Type your message..." rows={4} value={msgBody} onChange={(e) => setMsgBody(e.target.value)} required />
              <p className="text-[11px] text-muted-foreground">{msgBody.length} characters</p>
            </div>
            {sendResult && (
              <div className={cn("flex items-start gap-2 p-3 rounded-lg border text-sm",
                sendResult.success ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>
                {sendResult.success ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                {sendResult.message}
              </div>
            )}
            <Button type="submit" disabled={sending || !toPhone || !msgBody} className="gap-1.5">
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send SMS</>}
            </Button>
          </form>
        </div>
      )}

      {/* ── BULK SEND ── */}
      {activeTab === "bulk" && (
        <div className="space-y-4">
          {/* Segment picker */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Choose Recipients</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEGMENTS.map((seg) => {
                const Icon = seg.icon;
                const active = bulkSegment === seg.value;
                return (
                  <button key={seg.value} onClick={() => loadSegment(seg.value)}
                    className={cn("text-left rounded-xl border p-3 transition-all",
                      active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/60 hover:border-primary/20 hover:bg-muted/20")}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-xs font-semibold">{seg.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{seg.desc}</p>
                  </button>
                );
              })}
            </div>

            {bulkLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />Loading recipients...
              </div>
            )}

            {!bulkLoading && bulkSegment && (
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-primary">{bulkRecipients.length}</span>
                <span className="text-muted-foreground">recipients from segment</span>
                {manualContacts.length > 0 && (
                  <>
                    <span className="text-muted-foreground">+</span>
                    <span className="font-semibold text-primary">{manualContacts.length}</span>
                    <span className="text-muted-foreground">manual contacts</span>
                  </>
                )}
                <span className="text-muted-foreground">=</span>
                <span className="font-bold">{totalRecipients} total</span>
              </div>
            )}

            {!bulkLoading && bulkRecipients.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/20">
                {bulkRecipients.slice(0, 50).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-1.5 text-xs">
                    <span className="font-medium flex-1 truncate">{r.name || "—"}</span>
                    <span className="text-muted-foreground">{r.phone}</span>
                  </div>
                ))}
                {bulkRecipients.length > 50 && (
                  <div className="px-3 py-1.5 text-xs text-muted-foreground text-center">
                    ...and {bulkRecipients.length - 50} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Compose bulk message */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Compose Message</h3>
            <p className="text-[11px] text-muted-foreground">
              Use <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{guest}"}</code> or <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{name}"}</code> to personalize with the recipient's name.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Input value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} placeholder="e.g. Check-in Reminder" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message <span className="text-red-500">*</span></Label>
              <Textarea value={bulkMsg} onChange={(e) => setBulkMsg(e.target.value)} placeholder="Type your bulk message..." rows={4} />
              <p className="text-[11px] text-muted-foreground">{bulkMsg.length} characters per SMS</p>
            </div>

            {/* Quick template buttons */}
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => useTemplate(t)}
                  className="text-[10px] px-2 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                  {t.name}
                </button>
              ))}
            </div>

            {bulkResult && (
              <div className={cn("flex items-start gap-2 p-3 rounded-lg border text-sm",
                bulkResult.failed === 0 ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                {bulkResult.failed === 0 ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-medium">Bulk send complete</p>
                  <p className="text-xs mt-0.5">{bulkResult.sent} sent, {bulkResult.failed} failed out of {bulkResult.total}</p>
                </div>
              </div>
            )}

            <Button onClick={handleBulkSend} disabled={bulkSending || totalRecipients === 0 || !bulkMsg} className="gap-1.5">
              {bulkSending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Sending to {totalRecipients} recipients...</>
              ) : (
                <><Send className="h-4 w-4" />Send to {totalRecipients} recipients</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── CONTACTS ── */}
      {activeTab === "contacts" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Upload Contacts from CSV</h3>
            <p className="text-[11px] text-muted-foreground">
              CSV format: <code className="px-1 py-0.5 bg-muted rounded text-[10px]">Name, Phone</code> or <code className="px-1 py-0.5 bg-muted rounded text-[10px]">Phone, Name</code> — one per line. Header row is optional.
            </p>
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleCSVUpload} className="hidden" />
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />Upload CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setManualContacts([])}>
                <Trash2 className="h-3.5 w-3.5" />Clear All
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Add Contacts Manually</h3>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs mb-1 block">Name</Label>
                <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Contact name" className="h-9" />
              </div>
              <div className="flex-1">
                <Label className="text-xs mb-1 block">Phone<span className="text-red-500">*</span></Label>
                <Input value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="0241234567" className="h-9" />
              </div>
              <Button size="sm" onClick={addManualContact} disabled={!addPhone} className="h-9">Add</Button>
            </div>

            {manualContacts.length > 0 && (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/20">
                {manualContacts.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-xs group">
                    <span className="font-medium flex-1 truncate">{c.name || "—"}</span>
                    <span className="text-muted-foreground">{c.phone}</span>
                    <button onClick={() => removeManualContact(i)} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {manualContacts.length} manual contact{manualContacts.length !== 1 ? "s" : ""}. Go to <button onClick={() => setActiveTab("bulk")} className="text-primary hover:underline">Bulk Send</button> to message them.
            </p>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loadingMessages} className="gap-1.5 h-8">
              <RefreshCw className={cn("h-3.5 w-3.5", loadingMessages && "animate-spin")} />Refresh
            </Button>
          </div>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <DataTable columns={columns} data={messages} keyExtractor={(m) => m.id} total={messages.length} emptyMessage="No messages sent yet" />
          )}
        </div>
      )}

      {/* ── TEMPLATES ── */}
      {activeTab === "templates" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Click a template to use it. Replace <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{guest}"}</code>, <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{amount}"}</code>, <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{date}"}</code> with actual values.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button key={t.name} onClick={() => useTemplate(t)}
                className="text-left rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:shadow-black/[0.03] hover:border-primary/20 transition-all">
                <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />{t.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
