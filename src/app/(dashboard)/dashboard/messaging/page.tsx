"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Send, Phone, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw,
  MessageSquare, Clock, FileText,
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

const TEMPLATES = [
  { name: "Booking Confirmation", body: "Dear {guest}, your booking (Ref: {ref}) at Warriors Prayer Tower Complex is confirmed. Check-in: {date}. God bless you!" },
  { name: "Payment Receipt", body: "Dear {guest}, we have received your payment of GH₵{amount} for booking {ref}. Thank you! - WPTC" },
  { name: "Check-in Reminder", body: "Dear {guest}, this is a reminder that your check-in at Warriors Prayer Tower Complex is tomorrow ({date}). We look forward to welcoming you!" },
  { name: "Thank You", body: "Dear {guest}, thank you for staying at Warriors Prayer Tower Complex. We hope you had a blessed time. God bless you!" },
];

export default function MessagingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeTab, setActiveTab] = useState<"compose" | "history" | "templates">("compose");

  // Compose form
  const [toPhone, setToPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      }
    } catch { /* table may not exist yet */ }
    finally { setLoadingMessages(false); }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toPhone || !msgBody) return;
    setSending(true);
    setSendResult(null);
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
      setSendResult({ success: false, message: "Network error. Please try again." });
    } finally { setSending(false); }
  };

  const useTemplate = (template: (typeof TEMPLATES)[number]) => {
    setMsgBody(template.body);
    setSubject(template.name);
    setActiveTab("compose");
  };

  const tabs = [
    { key: "compose" as const, label: "Compose", icon: Send },
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
    { header: "Channel", accessor: () => (
      <Badge variant="outline" className="gap-1 text-[10px]"><Phone className="h-3 w-3" />SMS</Badge>
    )},
    { header: "Message", accessor: (m) => (
      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] block">{m.body}</span>
    )},
    { header: "Status", accessor: (m) => (
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", m.status === "SENT" ? "bg-emerald-400" : "bg-red-400")} />
        <span className={cn("text-xs font-medium", m.status === "SENT" ? "text-emerald-700" : "text-red-700")}>{m.status}</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Messaging" description="Send SMS messages to guests and view history" />

      {/* Tab bar */}
      <div className="flex gap-1.5 border-b border-border/60 pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Compose */}
      {activeTab === "compose" && (
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <form onSubmit={handleSend} className="space-y-4">
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
              <p className="text-[11px] text-muted-foreground">{msgBody.length} characters &bull; SMS via Hubtel</p>
            </div>

            {sendResult && (
              <div className={cn(
                "flex items-start gap-2 p-3 rounded-lg border text-sm",
                sendResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
              )}>
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

      {/* History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => fetchMessages()} disabled={loadingMessages} className="gap-1.5 h-8">
              <RefreshCw className={cn("h-3.5 w-3.5", loadingMessages && "animate-spin")} />
              Refresh
            </Button>
          </div>
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable columns={columns} data={messages} keyExtractor={(m) => m.id} total={messages.length} emptyMessage="No messages sent yet" />
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === "templates" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Click a template to pre-fill the compose form. Replace <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{guest}"}</code>, <code className="px-1 py-0.5 bg-muted rounded text-[10px]">{"{ref}"}</code>, etc. with actual values.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => useTemplate(t)}
                className="text-left rounded-xl border border-border/60 bg-card p-4 hover:shadow-md hover:shadow-black/[0.03] hover:border-primary/20 transition-all"
              >
                <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  {t.name}
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
