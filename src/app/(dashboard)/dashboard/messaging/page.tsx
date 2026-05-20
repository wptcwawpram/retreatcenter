"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { formatDate } from "@/lib/format";
import { Send, Phone, Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

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
  {
    name: "Booking Confirmation",
    body: "Dear {guest}, your booking (Ref: {ref}) at Warriors Prayer Tower Complex is confirmed. Check-in: {date}. God bless you!",
  },
  {
    name: "Payment Receipt",
    body: "Dear {guest}, we have received your payment of GH₵{amount} for booking {ref}. Thank you! - WPTC",
  },
  {
    name: "Check-in Reminder",
    body: "Dear {guest}, this is a reminder that your check-in at Warriors Prayer Tower Complex is tomorrow ({date}). We look forward to welcoming you!",
  },
  {
    name: "Thank You",
    body: "Dear {guest}, thank you for staying at Warriors Prayer Tower Complex. We hope you had a blessed time. God bless you!",
  },
];

export default function MessagingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Compose form
  const [toPhone, setToPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState("compose");

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!toPhone || !body) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: toPhone,
          recipient_name: recipientName,
          subject,
          message: body,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ success: true, message: "SMS sent successfully!" });
        setToPhone("");
        setRecipientName("");
        setSubject("");
        setBody("");
        fetchMessages(); // refresh history
      } else {
        setSendResult({ success: false, message: data.error || "Failed to send SMS" });
      }
    } catch {
      setSendResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const useTemplate = (template: typeof TEMPLATES[number]) => {
    setBody(template.body);
    setSubject(template.name);
    setActiveTab("compose");
  };

  const columns: Column<Message>[] = [
    {
      header: "Date",
      accessor: (m) => <span className="text-sm">{formatDate(m.created_at)}</span>,
    },
    {
      header: "To",
      accessor: (m) => (
        <div>
          {m.recipient_name && <p className="font-medium text-sm">{m.recipient_name}</p>}
          <p className="text-xs text-muted-foreground">{m.to_phone}</p>
        </div>
      ),
    },
    {
      header: "Channel",
      accessor: () => (
        <Badge variant="outline" className="gap-1">
          <Phone className="h-3 w-3" />SMS
        </Badge>
      ),
    },
    {
      header: "Subject",
      accessor: (m) => <span className="text-sm">{m.subject || "—"}</span>,
    },
    {
      header: "Message",
      accessor: (m) => (
        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px] block">
          {m.body}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (m) => (
        <Badge
          className={
            m.status === "SENT"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }
        >
          {m.status === "SENT" ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {m.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messaging"
        description="Send SMS messages to guests and view communication history"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">
            History {messages.length > 0 && `(${messages.length})`}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to-phone">Phone Number *</Label>
                  <Input
                    id="to-phone"
                    placeholder="+233 XXX XXX XXX"
                    value={toPhone}
                    onChange={(e) => setToPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Name</Label>
                  <Input
                    id="recipient"
                    placeholder="Guest name (optional)"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  placeholder="Type your message..."
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {body.length} characters • SMS is sent via Hubtel
                </p>
              </div>

              {sendResult && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${
                    sendResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {sendResult.success ? (
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  )}
                  {sendResult.message}
                </div>
              )}

              <Button
                onClick={handleSend}
                disabled={sending || !toPhone || !body}
                className="gap-1.5"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send SMS
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={fetchMessages} disabled={loadingMessages}>
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingMessages ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          {loadingMessages ? (
            <Card>
              <CardContent className="p-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={columns}
              data={messages}
              keyExtractor={(m) => m.id}
              total={messages.length}
              emptyMessage="No messages sent yet"
            />
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Click a template to pre-fill the compose form. Replace <code className="px-1 py-0.5 bg-muted rounded text-xs">{"{guest}"}</code>,{" "}
            <code className="px-1 py-0.5 bg-muted rounded text-xs">{"{ref}"}</code>, etc. with actual values before sending.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <Card
                key={t.name}
                className="hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300"
                onClick={() => useTemplate(t)}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {t.name}
                    <Badge variant="outline" className="text-xs font-normal">Click to use</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
