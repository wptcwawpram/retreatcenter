import { createServerClient } from "@supabase/ssr";

export interface MessageTemplate {
  key: string;
  label: string;
  description: string;
  defaultText: string;
  variables: string[];
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    key: "msg_booking_confirmation",
    label: "Booking Confirmation",
    description: "Sent to guest after successful payment",
    defaultText: "Dear {guest_name}, your booking (Ref: {reference}) at Warriors Prayer Tower Complex is confirmed. Check-in: {check_in}, Check-out: {check_out}. God bless you!",
    variables: ["guest_name", "reference", "check_in", "check_out"],
  },
  {
    key: "msg_payment_received",
    label: "Payment Received",
    description: "Sent to guest when payment is recorded",
    defaultText: "Dear {guest_name}, we have received your payment of GH₵{amount} for booking {reference}. Thank you! - WPTC",
    variables: ["guest_name", "amount", "reference"],
  },
  {
    key: "msg_checkin_welcome",
    label: "Check-in Welcome",
    description: "Sent to guest upon check-in",
    defaultText: "Dear {guest_name}, welcome to Warriors Prayer Tower Complex! You are now checked in. Check-out: {check_out}. {balance_note}We wish you a blessed stay!",
    variables: ["guest_name", "check_out", "balance_note"],
  },
  {
    key: "msg_checkout_farewell",
    label: "Check-out Farewell",
    description: "Sent to guest upon check-out",
    defaultText: "Dear {guest_name}, thank you for staying at Warriors Prayer Tower Complex! You have been checked out. {balance_note}God bless you!",
    variables: ["guest_name", "balance_note"],
  },
  {
    key: "msg_complaint_received",
    label: "Complaint Received",
    description: "Sent to guest when they lodge a complaint",
    defaultText: "WPTC: Your complaint \"{subject}\" has been received and is being reviewed. We will update you on the progress. Thank you for your feedback.",
    variables: ["subject"],
  },
  {
    key: "msg_complaint_update",
    label: "Complaint Update",
    description: "Prefix for admin updates sent to guest about complaints",
    defaultText: "WPTC Update on \"{subject}\": {message}",
    variables: ["subject", "message"],
  },
  {
    key: "msg_staff_invite",
    label: "Staff Invitation",
    description: "Sent to new employees with onboarding link",
    defaultText: "Hi {first_name}, you've been invited to join WPTC as staff. Click the link to set up your account: {link}",
    variables: ["first_name", "link"],
  },
  {
    key: "msg_otp_admin",
    label: "Admin Login OTP",
    description: "OTP code for admin 2FA login",
    defaultText: "WPTC Admin Login: Your verification code is {code}. Valid for 5 minutes. Do not share this code.",
    variables: ["code"],
  },
  {
    key: "msg_otp_guest",
    label: "Guest Portal OTP",
    description: "OTP code for guest portal login",
    defaultText: "WPTC Guest Portal: Your verification code is {code}. Valid for 5 minutes.",
    variables: ["code"],
  },
  {
    key: "msg_otp_onboard",
    label: "Employee Onboard OTP",
    description: "OTP code for employee account setup",
    defaultText: "WPTC: Your verification code is {code}. Valid for 5 minutes.",
    variables: ["code"],
  },
  {
    key: "msg_checkin_reminder",
    label: "Check-in Reminder",
    description: "Sent to guest the day before check-in",
    defaultText: "Dear {guest_name}, this is a reminder that your check-in at Warriors Prayer Tower Complex is tomorrow ({date}). We look forward to welcoming you!",
    variables: ["guest_name", "date"],
  },
  {
    key: "msg_checkout_reminder",
    label: "Check-out Reminder",
    description: "Sent to guest the day before check-out",
    defaultText: "Dear {guest_name}, your check-out from Warriors Prayer Tower Complex is tomorrow ({date}). We hope you enjoyed your stay. God bless!",
    variables: ["guest_name", "date"],
  },
  {
    key: "msg_admin_notif",
    label: "Admin Alert Format",
    description: "Format for admin SMS notifications",
    defaultText: "[WPTC {type}] {subject}\n{message}",
    variables: ["type", "subject", "message"],
  },
];

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

let cachedTemplates: Record<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

export async function getMessageTemplate(key: string): Promise<string> {
  const now = Date.now();
  if (!cachedTemplates || now - cacheTime > CACHE_TTL) {
    const supabase = serviceClient();
    const keys = MESSAGE_TEMPLATES.map((t) => t.key);
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", keys);

    cachedTemplates = {};
    data?.forEach((s: { key: string; value: string }) => {
      if (s.value) cachedTemplates![s.key] = s.value;
    });
    cacheTime = now;
  }

  const template = MESSAGE_TEMPLATES.find((t) => t.key === key);
  return cachedTemplates[key] || template?.defaultText || "";
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [k, v] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return result;
}

export async function renderMessage(key: string, vars: Record<string, string>): Promise<string> {
  const template = await getMessageTemplate(key);
  return fillTemplate(template, vars);
}
