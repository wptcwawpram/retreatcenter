import type {
  Room,
  Booking,
  Guest,
  Payment,
  HousekeepingTask,
  Building,
  User,
  BookingRoom,
  Complaint,
  FinanceRecord,
} from "@/generated/prisma/client";

// ─── Room Types ─────────────────────────────────────────────────────────────

export type RoomWithBuilding = Room & {
  building: Building;
};

export type RoomWithDetails = Room & {
  building: Building;
  bookingRooms: (BookingRoom & { booking: Booking })[];
  housekeepingTasks: HousekeepingTask[];
};

// ─── Booking Types ──────────────────────────────────────────────────────────

export type BookingWithDetails = Booking & {
  guest: Guest;
  bookedBy: User;
  bookingRooms: (BookingRoom & { room: Room })[];
  payments: Payment[];
};

export type BookingWithRooms = Booking & {
  bookingRooms: (BookingRoom & { room: Room })[];
};

// ─── Guest Types ────────────────────────────────────────────────────────────

export type GuestWithBookings = Guest & {
  bookings: Booking[];
};

// ─── Payment Types ──────────────────────────────────────────────────────────

export type PaymentWithBooking = Payment & {
  booking: Booking & {
    guest: Guest;
  };
  processedBy: User;
};

// ─── Housekeeping Types ─────────────────────────────────────────────────────

export type HousekeepingTaskWithDetails = HousekeepingTask & {
  room: Room & { building: Building };
  assignedTo: User | null;
  inspectedBy: User | null;
};

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export interface DashboardStats {
  bookingsToday: number;
  expectedCheckIns: number;
  expectedCheckOuts: number;
  occupiedRooms: number;
  availableRooms: number;
  dirtyRooms: number;
  totalRooms: number;
  pendingPayments: number;
  incomeToday: number;
  expensesToday: number;
  openComplaints: number;
  occupancyRate: number;
}

// ─── Action Response ────────────────────────────────────────────────────────

export type ActionResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Filter Types ───────────────────────────────────────────────────────────

export interface RoomFilters {
  status?: string;
  buildingId?: string;
  roomType?: string;
  search?: string;
}

export interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaymentFilters {
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
