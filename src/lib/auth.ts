// Auth helpers — provider TBD (Clerk removed)
// Placeholder functions maintain the same API so dashboard code doesn't break

import type { UserRole } from "@/generated/prisma/client";

/**
 * Get the current authenticated user.
 * TODO: Replace with real auth provider
 */
export async function getCurrentUser() {
  return null;
}

/**
 * Check if the current user has one of the required roles.
 */
export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

/**
 * Check if the current user has at least staff-level access.
 */
export async function requireStaff() {
  return requireRole(
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "RECEPTIONIST",
    "HOUSEKEEPER",
    "ACCOUNTANT",
    "MAINTENANCE"
  );
}

/**
 * Check if the current user has admin-level access.
 */
export async function requireAdmin() {
  return requireRole("SUPER_ADMIN", "ADMIN");
}

/**
 * Check if the current user has management-level access.
 */
export async function requireManager() {
  return requireRole("SUPER_ADMIN", "ADMIN", "MANAGER");
}

/**
 * Role hierarchy check
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 90,
  MANAGER: 70,
  ACCOUNTANT: 50,
  RECEPTIONIST: 40,
  HOUSEKEEPER: 30,
  MAINTENANCE: 30,
  GUEST: 10,
};

export function hasHigherOrEqualRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
