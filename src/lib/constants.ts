// ─── Application Constants ──────────────────────────────────────────────────

export const APP_NAME = "WPTC Management";
export const APP_DESCRIPTION =
  "Warriors Prayer Tower Complex - Hybrid Management System";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Room Type Labels ───────────────────────────────────────────────────────

export const ROOM_TYPE_LABELS: Record<string, string> = {
  ONE_IN_ONE: "1 in 1 (Single)",
  TWO_IN_ONE: "2 in 1 (Double)",
  THREE_IN_ONE: "3 in 1 (Triple)",
  FOUR_IN_ONE: "4 in 1 (Quad)",
  DORMITORY: "Dormitory",
  CUSTOM: "Custom Setup",
};

// ─── Room Status Labels & Colors ────────────────────────────────────────────

export const ROOM_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  AVAILABLE: {
    label: "Available",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 border-teal-500/20",
  },
  OCCUPIED: {
    label: "Occupied",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  DIRTY: {
    label: "Dirty",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  CLEANING: {
    label: "Cleaning",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
  },
  AWAITING_INSPECTION: {
    label: "Awaiting Inspection",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
  },
  MAINTENANCE: {
    label: "Under Maintenance",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
  BLOCKED: {
    label: "Blocked",
    color: "text-gray-700",
    bgColor: "bg-gray-100 border-gray-300",
  },
};

// ─── Booking Status Labels & Colors ─────────────────────────────────────────

export const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 border-teal-500/20",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    color: "text-gray-700",
    bgColor: "bg-gray-100 border-gray-300",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
  NO_SHOW: {
    label: "No Show",
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
  },
  PENDING_SYNC: {
    label: "Pending Sync",
    color: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-200",
  },
};

// ─── Payment Method Labels ──────────────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Bank Transfer",
  PAYSTACK: "Paystack (Online)",
  CHEQUE: "Cheque",
  MANUAL: "Manual Entry",
};

// ─── Payment Status Labels & Colors ─────────────────────────────────────────

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-teal-400",
    bgColor: "bg-teal-500/10 border-teal-500/20",
  },
  FAILED: {
    label: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
  },
  PARTIALLY_PAID: {
    label: "Partially Paid",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
  },
};

// ─── Complaint Categories ───────────────────────────────────────────────────

export const COMPLAINT_CATEGORY_LABELS: Record<string, string> = {
  NOISE: "Noise",
  CLEANLINESS: "Cleanliness",
  MAINTENANCE: "Maintenance",
  SERVICE: "Service",
  FOOD: "Food",
  OTHER: "Other",
};

// ─── User Role Labels ───────────────────────────────────────────────────────

export const USER_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  RECEPTIONIST: "Receptionist",
  HOUSEKEEPER: "Housekeeper",
  ACCOUNTANT: "Accountant",
  MAINTENANCE: "Maintenance",
  GUEST: "Guest",
};

// ─── Currency ───────────────────────────────────────────────────────────────

export const CURRENCY = {
  code: "GHS",
  symbol: "GH₵",
  name: "Ghana Cedi",
};

// ─── Housekeeping Priority ──────────────────────────────────────────────────

export const HOUSEKEEPING_PRIORITY: Record<
  number,
  { label: string; color: string }
> = {
  1: { label: "Normal", color: "text-blue-600" },
  2: { label: "Urgent", color: "text-amber-600" },
  3: { label: "Critical", color: "text-red-600" },
};

// ─── Navigation ─────────────────────────────────────────────────────────────

export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Rooms", href: "/dashboard/rooms", icon: "BedDouble" },
  { label: "Bookings", href: "/dashboard/bookings", icon: "CalendarCheck" },
  { label: "Housekeeping", href: "/dashboard/housekeeping", icon: "SprayCan" },
  { label: "Guests", href: "/dashboard/guests", icon: "Users" },
  { label: "Payments", href: "/dashboard/payments", icon: "CreditCard" },
  { label: "Finance", href: "/dashboard/finance", icon: "TrendingUp" },
  { label: "Complaints", href: "/dashboard/complaints", icon: "MessageSquareWarning" },
  { label: "Utilities", href: "/dashboard/utilities", icon: "Zap" },
  { label: "Inventory", href: "/dashboard/inventory", icon: "Package" },
  { label: "Employees", href: "/dashboard/employees", icon: "UserCog" },
  { label: "Messaging", href: "/dashboard/messaging", icon: "Send" },
  { label: "Events", href: "/dashboard/events", icon: "Calendar" },
  { label: "Reports", href: "/dashboard/reports", icon: "BarChart3" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;

export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rooms", href: "/rooms" },
  { label: "Facilities", href: "/facilities" },
  { label: "Gallery", href: "/gallery" },
  { label: "Packages", href: "/packages" },
  { label: "Events", href: "/events" },
  { label: "Book Now", href: "/booking" },
  { label: "Guest Portal", href: "/guest-portal" },
  { label: "Contact", href: "/contact" },
] as const;
