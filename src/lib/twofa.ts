// Signed, unforgeable 2FA-completed token (usable in the Edge middleware).
// Cookie is httpOnly + session-scoped so 2FA is required again on a new browser
// session; the token is HMAC-signed so it can't be forged by setting a cookie.

export const TWOFA_COOKIE = "wptc_2fa";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // hard cap: 12h even within a session

function secret() {
  return process.env.TWOFA_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "wptc-2fa-fallback-secret";
}

const encoder = new TextEncoder();

async function hmacHex(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// token = "<userId>.<expiryMs>.<hmac(userId.expiryMs)>"
export async function createTwofaToken(userId: string): Promise<string> {
  const exp = Date.now() + MAX_AGE_MS;
  const data = `${userId}.${exp}`;
  return `${data}.${await hmacHex(data)}`;
}

export async function verifyTwofaToken(token: string | undefined, userId: string): Promise<boolean> {
  if (!token || !userId) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [uid, exp, sig] = parts;
  if (uid !== userId) return false;
  if (!exp || Number(exp) < Date.now()) return false;
  const expected = await hmacHex(`${uid}.${exp}`);
  // constant-ish comparison
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
