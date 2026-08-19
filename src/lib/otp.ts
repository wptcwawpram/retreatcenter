import { createServerClient } from "@supabase/ssr";

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export function generateOTP(): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function storeOTP(identifier: string, purpose: "admin_2fa" | "guest_login" | "employee_onboard"): Promise<string> {
  const supabase = createServiceClient();
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from("otp_codes").delete().eq("identifier", identifier).eq("purpose", purpose);

  await supabase.from("otp_codes").insert({
    identifier,
    code,
    purpose,
    expires_at: expiresAt,
    attempts: 0,
  });

  return code;
}

export async function verifyOTP(
  identifier: string,
  code: string,
  purpose: "admin_2fa" | "guest_login" | "employee_onboard",
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { data: otp } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("identifier", identifier)
    .eq("purpose", purpose)
    .maybeSingle();

  if (!otp) return { valid: false, error: "No verification code found. Please request a new one." };

  if (new Date(otp.expires_at) < new Date()) {
    await supabase.from("otp_codes").delete().eq("id", otp.id);
    return { valid: false, error: "Code expired. Please request a new one." };
  }

  if (otp.attempts >= 5) {
    await supabase.from("otp_codes").delete().eq("id", otp.id);
    return { valid: false, error: "Too many attempts. Please request a new code." };
  }

  if (otp.code !== code) {
    await supabase.from("otp_codes").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
    return { valid: false, error: `Invalid code. ${4 - otp.attempts} attempts remaining.` };
  }

  await supabase.from("otp_codes").delete().eq("id", otp.id);
  return { valid: true };
}
