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
