import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "receptionist" | "housekeeping" | "manager";

const ROLE_HIERARCHY: Record<string, number> = {
  admin: 100,
  manager: 70,
  receptionist: 40,
  housekeeping: 30,
};

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Staff",
    role: (profile?.role as AppRole) || "receptionist",
    phone: profile?.phone || null,
    avatar_url: profile?.avatar_url || null,
    is_active: profile?.is_active ?? true,
  };
}

export async function requireRole(...roles: AppRole[]) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;
  return user;
}

export async function requireStaff() {
  return requireRole("admin", "manager", "receptionist", "housekeeping");
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireManager() {
  return requireRole("admin", "manager");
}

export function hasHigherOrEqualRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}
