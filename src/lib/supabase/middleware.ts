import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { verifyTwofaToken, TWOFA_COOKIE } from "@/lib/twofa";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const protectedPath = path.startsWith("/dashboard") || path.startsWith("/admin");
  const twofaOk = user ? await verifyTwofaToken(request.cookies.get(TWOFA_COOKIE)?.value, user.id) : false;

  // /admin shortcut — redirect to dashboard if logged in (+2FA), login otherwise
  if (path === "/admin") {
    if (user && twofaOk) return NextResponse.redirect(new URL("/dashboard", request.url));
    if (user && !twofaOk) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("require2fa", "1");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in users visiting /login — only skip login if 2FA is also complete
  if (user && twofaOk && path === "/login") {
    const redirect = request.nextUrl.searchParams.get("redirect") || "/dashboard";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  // Not authenticated at all → login
  if (!user && protectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated but 2FA not completed for this browser session → finish 2FA
  if (user && !twofaOk && protectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("require2fa", "1");
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
