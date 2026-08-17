"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

type StepStatus = "idle" | "running" | "done" | "error";

export default function SetupPage() {
  const [seedStatus, setSeedStatus] = useState<StepStatus>("idle");
  const [adminStatus, setAdminStatus] = useState<StepStatus>("idle");
  const [seedMsg, setSeedMsg] = useState("");
  const [adminMsg, setAdminMsg] = useState("");
  const [running, setRunning] = useState(false);

  const runSetup = async () => {
    setRunning(true);

    setSeedStatus("running");
    try {
      const seedRes = await fetch("/api/rooms/seed", { method: "POST" });
      const seedData = await seedRes.json();
      if (seedRes.ok) {
        setSeedStatus("done");
        setSeedMsg(seedData.message || `Seeded ${seedData.count ?? ""} rooms`);
      } else {
        setSeedStatus("error");
        setSeedMsg(seedData.error || "Failed to seed rooms");
      }
    } catch {
      setSeedStatus("error");
      setSeedMsg("Network error");
    }

    setAdminStatus("running");
    try {
      const adminRes = await fetch("/api/auth/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: "WPTC-SETUP-2024" }),
      });
      const adminData = await adminRes.json();
      if (adminRes.ok) {
        setAdminStatus("done");
        setAdminMsg(adminData.message || "Super admin configured");
      } else {
        setAdminStatus("error");
        setAdminMsg(adminData.error || "Failed to setup admin");
      }
    } catch {
      setAdminStatus("error");
      setAdminMsg("Network error");
    }

    setRunning(false);
  };

  const icon = (s: StepStatus) => {
    if (s === "running") return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (s === "done") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (s === "error") return <XCircle className="h-5 w-5 text-red-500" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  };

  const allDone = seedStatus === "done" && adminStatus === "done";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">WPTC Setup</h1>
          <p className="text-sm text-muted-foreground">One click to initialize everything</p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            {icon(seedStatus)}
            <div>
              <p className="font-medium text-sm">Seed Room Inventory</p>
              <p className="text-xs text-muted-foreground">{seedMsg || "26 rooms including Suite 1 & 2"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {icon(adminStatus)}
            <div>
              <p className="font-medium text-sm">Configure Super Admin</p>
              <p className="text-xs text-muted-foreground">{adminMsg || "Set Dr. Worship Odoi as super admin"}</p>
            </div>
          </div>
        </div>

        {allDone ? (
          <Button className="w-full" onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        ) : (
          <Button className="w-full" onClick={runSetup} disabled={running}>
            {running ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Setting up...</>
            ) : (
              <><Rocket className="h-4 w-4 mr-2" />Run Setup</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
