"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { formatDate } from "@/lib/format";
import { Send, MessageSquare, Mail, Phone } from "lucide-react";

const DEMO_MESSAGES = [
  { id: "m1", to: "Rev. Kwame Mensah", channel: "SMS", subject: "Booking Confirmation", status: "Sent", date: "2026-05-08" },
  { id: "m2", to: "Grace Assembly Youth", channel: "Email", subject: "Check-in Details", status: "Sent", date: "2026-05-10" },
  { id: "m3", to: "Dr. Yaw Asante", channel: "WhatsApp", subject: "Booking Reminder", status: "Sent", date: "2026-05-14" },
  { id: "m4", to: "Bethel Church Conference", channel: "Email", subject: "Payment Receipt", status: "Failed", date: "2026-05-15" },
];

type Message = (typeof DEMO_MESSAGES)[number];

export default function MessagingPage() {
  const columns: Column<Message>[] = [
    { header: "Date", accessor: (m) => <span className="text-sm">{formatDate(m.date)}</span> },
    { header: "To", accessor: (m) => <span className="font-medium">{m.to}</span> },
    { header: "Channel", accessor: (m) => {
      const icon = m.channel === "SMS" ? Phone : m.channel === "Email" ? Mail : MessageSquare;
      const Icon = icon;
      return <Badge variant="outline" className="gap-1"><Icon className="h-3 w-3" />{m.channel}</Badge>;
    }},
    { header: "Subject", accessor: "subject" },
    { header: "Status", accessor: (m) => (
      <Badge className={m.status === "Sent" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
        {m.status}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Messaging" description="Send messages to guests and view communication history" />

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Input placeholder="Guest name or phone number" />
                </div>
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select defaultValue="sms">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Message subject" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Type your message..." rows={5} />
              </div>
              <Button className="gap-1.5">
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <DataTable columns={columns} data={DEMO_MESSAGES} keyExtractor={(m) => m.id} total={DEMO_MESSAGES.length} emptyMessage="No messages sent" />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Booking Confirmation", body: "Dear {guest}, your booking {ref} is confirmed. Check-in: {date}." },
              { name: "Payment Receipt", body: "Dear {guest}, we received your payment of {amount} for booking {ref}." },
              { name: "Check-in Reminder", body: "Dear {guest}, this is a reminder that your check-in for {ref} is tomorrow." },
              { name: "Thank You", body: "Dear {guest}, thank you for staying at WPTC. We hope you had a blessed time." },
            ].map((t) => (
              <Card key={t.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{t.name}</h4>
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
