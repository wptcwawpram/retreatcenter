import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { notifyAdmin } from "@/lib/notify-admin";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    if (!firstName || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    const { error } = await supabase.from("contact_messages").insert({
      name: fullName,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      message,
    });

    if (error) {
      if (error.code === "42P01") {
        await supabase.rpc("exec_sql", {
          sql: `CREATE TABLE IF NOT EXISTS contact_messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT now()
          )`,
        }).then(() =>
          supabase.from("contact_messages").insert({
            name: fullName,
            email: email || null,
            phone: phone || null,
            subject: subject || null,
            message,
          })
        );
      } else {
        throw error;
      }
    }

    notifyAdmin({
      type: "contact",
      subject: `New Contact: ${subject || "No subject"}`,
      message: `From: ${fullName}\nPhone: ${phone || "N/A"}\nEmail: ${email || "N/A"}\n\n${message}`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
