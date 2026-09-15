import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * POST /api/payments/record
 * Records a payment and keeps bookings + finance accounts in sync.
 *
 * Body: {
 *   booking_id, amount, method, status, notes?,
 *   account_id?,          // finance account to credit
 *   payment_lines?        // for split payments: [{amount, method, account_id}]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { booking_id, amount, method, status, notes, account_id, payment_lines } = body;

    if (!booking_id) return NextResponse.json({ error: "booking_id is required" }, { status: 400 });

    const totalAmount = Number(amount) || 0;
    if (totalAmount <= 0) return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });

    const supabase = serviceClient();
    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch the booking so we can compute new paid_amount
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("reference, paid_amount, total_amount, balance, guest:guests(full_name)")
      .eq("id", booking_id)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const oldPaid = Number(booking.paid_amount) || 0;
    const bookingTotal = Number(booking.total_amount) || 0;
    const guestName = (booking.guest as { full_name?: string } | null)?.full_name ?? "";

    // Normalise into lines. Split payments create one payment row + finance record
    // per line so the Payments page and Accounting both reflect every entry.
    const lines: Array<{ amount: number; method: string; account_id: string | null }> =
      Array.isArray(payment_lines) && payment_lines.length > 0
        ? payment_lines
        : [{ amount: totalAmount, method: method || "CASH", account_id: account_id || null }];

    const createdPayments: unknown[] = [];
    let recordedTotal = 0;

    for (const line of lines) {
      const lineAmt = Number(line.amount) || 0;
      if (lineAmt <= 0) continue;
      recordedTotal += lineAmt;
      const lineMethod = line.method || "CASH";

      // 1. Insert payment row (shows on Payments page)
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
          booking_id,
          amount: lineAmt,
          method: lineMethod,
          status: status || "COMPLETED",
          reference: `MAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          paystack_reference: null,
          notes: notes || null,
          recorded_by: user.id,
        })
        .select()
        .single();
      if (payErr) throw payErr;
      createdPayments.push(payment);

      // 2. Create finance income record (linked to this payment when possible)
      const finRecord: Record<string, unknown> = {
        type: "INCOME",
        category: "Booking Payment",
        description: `${lineMethod} payment for booking ${booking.reference} (${guestName})`,
        amount: lineAmt,
        date: today,
        booking_id,
        account_id: line.account_id || null,
        reference: booking.reference,
        payment_method: lineMethod,
        recorded_by: user.id,
        payment_id: payment?.id || null,
      };
      const { error: finErr } = await supabase.from("finance_records").insert(finRecord);
      if (finErr && /column/i.test(finErr.message)) {
        delete finRecord.payment_id;
        await supabase.from("finance_records").insert(finRecord);
      } else if (finErr) {
        console.error("Finance record error:", finErr);
      }

      // 3. Credit the account balance
      if (line.account_id) {
        const { data: acct } = await supabase
          .from("finance_accounts")
          .select("balance")
          .eq("id", line.account_id)
          .single();
        if (acct) {
          await supabase
            .from("finance_accounts")
            .update({ balance: Number(acct.balance) + lineAmt, updated_at: new Date().toISOString() })
            .eq("id", line.account_id);
        }
      }
    }

    // 4. Update booking paid_amount, balance, payment_status once
    const newPaid = oldPaid + recordedTotal;
    const newBalance = Math.max(0, bookingTotal - newPaid);
    const payStatus = newPaid >= bookingTotal && bookingTotal > 0 ? "PAID"
      : newPaid > 0 ? "PARTIAL"
      : "UNPAID";

    const { error: bookingUpdateErr } = await supabase
      .from("bookings")
      .update({ paid_amount: newPaid, balance: newBalance, payment_status: payStatus })
      .eq("id", booking_id);
    if (bookingUpdateErr) throw bookingUpdateErr;

    return NextResponse.json({ success: true, payments: createdPayments, newPaid, newBalance, payStatus });
  } catch (error) {
    console.error("Record payment error:", error);
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
