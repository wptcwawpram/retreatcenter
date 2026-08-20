import { createServerClient } from "@supabase/ssr";
import { sendSms } from "@/lib/hubtel-sms";
import { renderMessage } from "@/lib/message-templates";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

interface NotifyOptions {
  type: "booking" | "contact" | "complaint" | "payment";
  subject: string;
  message: string;
}

export async function notifyAdmin({ type, subject, message }: NotifyOptions) {
  const supabase = createServiceClient();

  const settingKeys = [
    "notif_new_booking",
    "notif_payment",
    "notif_complaint",
    "admin_notif_phone",
    "admin_notif_email",
    "phone",
    "email",
  ];

  const { data: settings } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", settingKeys);

  const cfg: Record<string, string> = {};
  settings?.forEach((s: { key: string; value: string }) => {
    cfg[s.key] = s.value;
  });

  const typeToSetting: Record<string, string> = {
    booking: "notif_new_booking",
    payment: "notif_payment",
    complaint: "notif_complaint",
    contact: "notif_new_booking",
  };

  const settingKey = typeToSetting[type];
  if (settingKey && cfg[settingKey] === "false") {
    return;
  }

  const adminPhones = (cfg.admin_notif_phone || cfg.phone || "").split(",").map((p) => p.trim()).filter(Boolean);
  const adminEmails = (cfg.admin_notif_email || cfg.email || "").split(",").map((e) => e.trim()).filter(Boolean);

  const results: { sms?: string; email?: string } = {};

  if (adminPhones.length) {
    try {
      const smsText = await renderMessage("msg_admin_notif", { type: type.toUpperCase(), subject, message });
      await Promise.all(
        adminPhones.map((phone) => sendSms({ to: phone, message: smsText }))
      );
      results.sms = "sent";
    } catch (err) {
      console.error("Admin SMS notification failed:", err);
      results.sms = "failed";
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && adminEmails.length) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "WPTC Notifications <notifications@warriorsprayertowercomplex.com>",
          to: adminEmails,
          subject: `[WPTC] ${subject}`,
          text: message,
        }),
      });
      results.email = "sent";
    } catch (err) {
      console.error("Admin email notification failed:", err);
      results.email = "failed";
    }
  }

  return results;
}
