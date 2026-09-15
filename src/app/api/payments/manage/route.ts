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

type SC = ReturnType<typeof serviceClient>;
function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

// Recompute a booking's paid_amount/balance/payment_status from its COMPLETED payments
async function recomputeBooking(supabase: SC, bookingId: string) {
  if (!bookingId) return;
  const { data: booking } = await supabase.from("bookings").select("total_amount").eq("id", bookingId).single();
  if (!booking) return;
  const { data: pays } = await supabase.from("payments").select("amount, status").eq("booking_id", bookingId);
  const paid = (pays || [])
    .filter((p) => (p.status || "COMPLETED") === "COMPLETED")
    .reduce((s, p) => s + Number(p.amount), 0);
  const total = Number(booking.total_amount) || 0;
  const balance = Math.max(0, total - paid);
  const payStatus = paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
  await supabase.from("bookings").update({ paid_amount: paid, balance, payment_status: payStatus }).eq("id", bookingId);
}

async function adjustAccount(supabase: SC, accountId: string | null | undefined, delta: number) {
  if (!accountId || !delta) return;
  const { data: acct } = await supabase.from("finance_accounts").select("balance").eq("id", accountId).single();
  if (acct) {
    await supabase.from("finance_accounts").update({ balance: Number(acct.balance) + delta, updated_at: new Date().toISOString() }).eq("id", accountId);
  }
}

// Fetch finance income record(s) linked to a payment (by payment_id if present)
async function linkedFinanceRecords(supabase: SC, paymentId: string) {
  try {
    const { data, error } = await supabase
      .from("finance_records")
      .select("id, amount, account_id, type")
      .eq("payment_id", paymentId);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/**
 * DELETE /api/payments/manage  { id }
 * Deletes a payment, reverses its income record + account balance, and
 * recomputes the booking's paid/balance/status.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Payment id is required" }, { status: 400 });

    const supabase = serviceClient();
    const { data: payment } = await supabase.from("payments").select("id, booking_id").eq("id", id).single();
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // Reverse + remove linked income records
    const records = await linkedFinanceRecords(supabase, id);
    for (const r of records) {
      if (r.type === "INCOME") await adjustAccount(supabase, r.account_id, -Number(r.amount));
      await supabase.from("finance_records").delete().eq("id", r.id);
    }

    await supabase.from("payments").delete().eq("id", id);
    await recomputeBooking(supabase, payment.booking_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payment error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/payments/manage
 * Edit a payment. Body: { id, amount?, method?, status?, account_id?, booking_id?, notes? }
 * Updates the linked income record + account balances and recomputes affected booking(s).
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, amount, method, status, account_id, booking_id, notes } = body;
    if (!id) return NextResponse.json({ error: "Payment id is required" }, { status: 400 });

    const supabase = serviceClient();
    const { data: old } = await supabase.from("payments").select("*").eq("id", id).single();
    if (!old) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const newAmount = amount != null ? Number(amount) : Number(old.amount);
    if (newAmount <= 0) return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    const newMethod = method ?? old.method;
    const newStatus = status ?? old.status;
    const newBookingId = booking_id ?? old.booking_id;

    // Update the payment row
    const { error: updErr } = await supabase
      .from("payments")
      .update({ amount: newAmount, method: newMethod, status: newStatus, booking_id: newBookingId, notes: notes ?? old.notes })
      .eq("id", id);
    if (updErr) throw updErr;

    // Update the linked income record(s) + account balance
    const records = await linkedFinanceRecords(supabase, id);
    for (const r of records) {
      // reverse old effect on old account
      if (r.type === "INCOME") await adjustAccount(supabase, r.account_id, -Number(r.amount));
      const newAccount = account_id !== undefined ? account_id : r.account_id;
      await supabase.from("finance_records")
        .update({ amount: newAmount, account_id: newAccount || null, payment_method: newMethod, booking_id: newBookingId })
        .eq("id", r.id);
      // apply new effect on new account
      if (r.type === "INCOME") await adjustAccount(supabase, newAccount, newAmount);
    }

    // Recompute both bookings if the payment moved to a different booking
    await recomputeBooking(supabase, old.booking_id);
    if (newBookingId && newBookingId !== old.booking_id) await recomputeBooking(supabase, newBookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit payment error:", error);
    const msg = error instanceof Error ? error.message : "Failed to edit payment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
