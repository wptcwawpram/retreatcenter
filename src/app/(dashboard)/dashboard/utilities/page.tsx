"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Fuel, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const UTILITY_CARDS = [
  {
    title: "Power Supply",
    icon: Zap,
    iconBg: "bg-teal-500/10 text-teal-500",
    status: "Active — ECG",
    statusColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    details: [
      { label: "Last outage", value: "14 May, 2:30 PM" },
      { label: "Duration", value: "3 hours" },
      { label: "Outages this month", value: "6", bold: true },
    ],
  },
  {
    title: "Generator",
    icon: Fuel,
    iconBg: "bg-amber-50 text-amber-600",
    status: "Standby",
    statusColor: "bg-gray-50 text-gray-700 border-gray-200",
    details: [
      { label: "Fuel level", value: "65%", bold: true },
      { label: "Last run", value: "14 May, 2:30 PM" },
      { label: "Total hours", value: "18h this month" },
    ],
  },
  {
    title: "Water Supply",
    icon: Droplets,
    iconBg: "bg-blue-50 text-blue-600",
    status: "Normal",
    statusColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    details: [
      { label: "Tank level", value: "80%", bold: true },
      { label: "Last refill", value: "16 May" },
      { label: "Issues", value: "None" },
    ],
  },
];

const LOGS = [
  { date: "18 May", time: "08:00", event: "ECG power stable", type: "Power", dotColor: "bg-teal-400" },
  { date: "17 May", time: "22:15", event: "Generator stopped — ECG restored", type: "Generator", dotColor: "bg-amber-400" },
  { date: "17 May", time: "19:00", event: "Generator started — ECG outage", type: "Generator", dotColor: "bg-amber-400" },
  { date: "16 May", time: "10:00", event: "Water tank refilled to 100%", type: "Water", dotColor: "bg-blue-400" },
  { date: "14 May", time: "17:30", event: "ECG power restored", type: "Power", dotColor: "bg-teal-400" },
  { date: "14 May", time: "14:30", event: "ECG power outage — generator started", type: "Power", dotColor: "bg-red-400" },
];

export default function UtilitiesPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="Utilities" description="Monitor power, water, and generator usage" />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {UTILITY_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-md hover:shadow-black/[0.03] transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-xl", card.iconBg)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{card.title}</h3>
                  <Badge className={cn("text-[10px] border mt-0.5", card.statusColor)}>{card.status}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {card.details.map((d) => (
                  <div key={d.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className={d.bold ? "font-bold" : ""}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Logs */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Utility Logs</h3>
        <div className="space-y-0">
          {LOGS.map((log, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn("h-2 w-2 rounded-full shrink-0", log.dotColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{log.event}</span>
                <Badge variant="outline" className="text-[9px] ml-2 py-0">{log.type}</Badge>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{log.date}, {log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
