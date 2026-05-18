const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID!;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET!;
const HUBTEL_SENDER_ID = process.env.HUBTEL_SENDER_ID || "WPTC";

interface SendSmsParams {
  to: string; // Ghana phone number e.g. "0241234567" or "+233241234567"
  message: string;
}

interface HubtelSmsResponse {
  status: number;
  message: string;
  messageId?: string;
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  // Convert local format to international
  if (cleaned.startsWith("0")) {
    cleaned = "233" + cleaned.slice(1);
  }
  // Ensure it starts with country code
  if (!cleaned.startsWith("233")) {
    cleaned = "233" + cleaned;
  }
  return cleaned;
}

export async function sendSms({
  to,
  message,
}: SendSmsParams): Promise<HubtelSmsResponse> {
  const formattedTo = formatPhoneNumber(to);

  const auth = Buffer.from(
    `${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(
    `https://smsc.hubtel.com/v1/messages/send?clientsecret=${HUBTEL_CLIENT_SECRET}&clientid=${HUBTEL_CLIENT_ID}&from=${HUBTEL_SENDER_ID}&to=${formattedTo}&content=${encodeURIComponent(message)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Hubtel SMS error: ${res.status} ${error}`);
  }

  return res.json();
}

// Pre-built message templates
export const SMS_TEMPLATES = {
  bookingConfirmation: (
    guestName: string,
    reference: string,
    checkIn: string,
    checkOut: string,
  ) =>
    `Dear ${guestName}, your booking (Ref: ${reference}) at Warriors Prayer Tower Complex is confirmed. Check-in: ${checkIn}, Check-out: ${checkOut}. God bless you!`,

  paymentReceived: (
    guestName: string,
    amount: string,
    reference: string,
  ) =>
    `Dear ${guestName}, we have received your payment of GH₵${amount} for booking ${reference}. Thank you! - WPTC`,

  checkInReminder: (guestName: string, date: string) =>
    `Dear ${guestName}, this is a reminder that your check-in at Warriors Prayer Tower Complex is tomorrow (${date}). We look forward to welcoming you!`,

  checkOutReminder: (guestName: string, date: string) =>
    `Dear ${guestName}, your check-out from Warriors Prayer Tower Complex is tomorrow (${date}). We hope you enjoyed your stay. God bless!`,
};

export type { SendSmsParams, HubtelSmsResponse };
