import { NextRequest, NextResponse } from "next/server";
import { sendSms, SMS_TEMPLATES } from "@/lib/hubtel-sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, template, templateData } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    let smsMessage = message;

    // Use template if specified
    if (template && templateData) {
      const templateFn =
        SMS_TEMPLATES[template as keyof typeof SMS_TEMPLATES];
      if (templateFn) {
        smsMessage = (templateFn as (...args: string[]) => string)(
          ...(Object.values(templateData) as string[]),
        );
      }
    }

    if (!smsMessage) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const result = await sendSms({ to, message: smsMessage });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 },
    );
  }
}
