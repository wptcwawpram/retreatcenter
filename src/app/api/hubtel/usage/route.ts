import { NextRequest, NextResponse } from "next/server";
import { recordHubtelUsage } from "@/lib/hubtel-balance";

/**
 * POST /api/hubtel/usage — called by a LINKED project sharing the same Hubtel
 * account, so its SMS usage is deducted from the shared tracked balance.
 *
 * Auth: shared secret in the `x-hubtel-secret` header (or body.secret),
 * matching env HUBTEL_USAGE_SECRET.
 *
 * Body: { segments?, count?, source?, description? }
 *   - segments: number of SMS segments to deduct (preferred)
 *   - count: number of single-segment messages (used if segments omitted)
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.HUBTEL_USAGE_SECRET;
    if (!secret) return NextResponse.json({ error: "Usage reporting not configured" }, { status: 400 });

    const provided = request.headers.get("x-hubtel-secret");
    const body = await request.json().catch(() => ({}));
    if ((provided || body.secret) !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const segments = Number(body.segments) || Number(body.count) || 1;
    if (segments <= 0) return NextResponse.json({ error: "segments must be > 0" }, { status: 400 });

    const balance = await recordHubtelUsage({
      segments,
      source: body.source || "linked-project",
      description: body.description || "SMS sent (linked project)",
    });

    return NextResponse.json({ success: true, balance: balance ?? null });
  } catch (error) {
    console.error("Hubtel usage report error:", error);
    return NextResponse.json({ error: "Failed to record usage" }, { status: 500 });
  }
}
