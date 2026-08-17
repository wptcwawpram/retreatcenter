export type UserRole = "super_admin" | "admin" | "receptionist" | "housekeeping" | "manager" | "accountant" | "maintenance";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  number: string;
  name: string;
  type:
    | "2_IN_1"
    | "4_IN_1"
    | "6_IN_1"
    | "SUITE_FAN"
    | "SUITE_AC"
    | "APARTMENT"
    | "3_IN_1"
    | "KITCHEN";
  building: string;
  floor: number;
  capacity: number;
  beds: number;
  price_per_night: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "CLEANING" | "RESERVED" | "BLOCKED" | "DIRTY" | "AWAITING_INSPECTION";
  amenities: string[];
  has_ac: boolean;
  has_tv: boolean;
  has_fridge: boolean;
  description: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  id_type: string | null;
  id_number: string | null;
  address: string | null;
  nationality: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  reference: string;
  guest_id: string;
  guest?: Guest;
  room_ids: string[];
  rooms?: Room[];
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED"
    | "NO_SHOW";
  booking_type: "INDIVIDUAL" | "GROUP" | "EVENT";
  special_requests: string | null;
  hall_id: string | null;
  hall_days: number;
  hall_amount: number;
  payment_status: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  source: "WEBSITE" | "WALK_IN" | "PHONE" | "AGENT";
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  booking?: Booking;
  amount: number;
  method: "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER" | "PAYSTACK";
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  reference: string;
  paystack_reference: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface HousekeepingTask {
  id: string;
  room_id: string;
  room?: Room;
  assigned_to: string | null;
  assignee?: Profile;
  type: "CLEANING" | "DEEP_CLEAN" | "MAINTENANCE" | "INSPECTION";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  notes: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  booking_id: string | null;
  guest_id: string | null;
  guest?: Guest;
  room_id: string | null;
  category:
    | "NOISE"
    | "CLEANLINESS"
    | "MAINTENANCE"
    | "SERVICE"
    | "FOOD"
    | "OTHER";
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH";
  resolved_by: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier: string | null;
  last_restocked: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  name: string;
  organizer: string;
  venue_id: string | null;
  start_date: string;
  end_date: string;
  attendees: number;
  amount: number;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  date: string;
  recorded_by: string | null;
  booking_id: string | null;
  created_at: string;
}
