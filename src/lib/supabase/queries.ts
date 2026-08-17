import { createClient } from "./client";
import type {
  Room,
  Guest,
  Booking,
  Payment,
  HousekeepingTask,
  Complaint,
  InventoryItem,
  Event,
  FinanceRecord,
  Profile,
} from "./types";

function supabase() {
  return createClient();
}

// ═══════════════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════════════

export async function getRooms() {
  const { data, error } = await supabase()
    .from("rooms")
    .select("*")
    .order("building")
    .order("capacity")
    .order("number");
  if (error) throw error;
  return data as Room[];
}

export async function getRoomById(id: string) {
  const { data, error } = await supabase()
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Room;
}

export async function createRoom(room: Omit<Room, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase()
    .from("rooms")
    .insert(room)
    .select()
    .single();
  if (error) throw error;
  return data as Room;
}

export async function updateRoom(id: string, updates: Partial<Omit<Room, "id" | "created_at" | "updated_at">>) {
  const { error } = await supabase()
    .from("rooms")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function updateRoomStatus(id: string, status: Room["status"]) {
  const { error } = await supabase()
    .from("rooms")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRoom(id: string) {
  const { error } = await supabase()
    .from("rooms")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// GUESTS
// ═══════════════════════════════════════════════════════════════

export async function getGuests() {
  const { data, error } = await supabase()
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Guest[];
}

export async function createGuest(guest: Omit<Guest, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase()
    .from("guests")
    .insert(guest)
    .select()
    .single();
  if (error) throw error;
  return data as Guest;
}

export async function updateGuest(id: string, updates: Partial<Omit<Guest, "id" | "created_at" | "updated_at">>) {
  const { error } = await supabase()
    .from("guests")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteGuest(id: string) {
  const { error } = await supabase()
    .from("guests")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getGuestByPhone(phone: string) {
  const { data } = await supabase()
    .from("guests")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  return data as Guest | null;
}

// ═══════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════

export async function getBookings() {
  const { data, error } = await supabase()
    .from("bookings")
    .select("*, guest:guests(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (Booking & { guest: Guest })[];
}

export async function getBookingByReference(reference: string) {
  const { data, error } = await supabase()
    .from("bookings")
    .select("*, guest:guests(*)")
    .eq("reference", reference)
    .single();
  if (error) throw error;
  return data as Booking & { guest: Guest };
}

export async function createBooking(booking: Omit<Booking, "id" | "reference" | "created_at" | "updated_at">) {
  const { data, error } = await supabase()
    .from("bookings")
    .insert(booking)
    .select()
    .single();
  if (error) throw error;
  return data as Booking;
}

export async function updateBookingStatus(id: string, status: Booking["status"]) {
  const { error } = await supabase()
    .from("bookings")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function updateBooking(id: string, updates: Partial<Omit<Booking, "id" | "reference" | "created_at" | "updated_at">>) {
  const { error } = await supabase()
    .from("bookings")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function updateBookingPayment(id: string, paidAmount: number, paymentStatus: Booking["payment_status"]) {
  const { error } = await supabase()
    .from("bookings")
    .update({ paid_amount: paidAmount, balance: 0, payment_status: paymentStatus })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteBooking(id: string) {
  const { error } = await supabase()
    .from("bookings")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════════════

export async function getPayments() {
  const { data, error } = await supabase()
    .from("payments")
    .select("*, booking:bookings(reference, guest_id, guest:guests(full_name))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (Payment & { booking: { reference: string; guest_id: string; guest: { full_name: string } } })[];
}

export async function createPayment(payment: Omit<Payment, "id" | "created_at">) {
  const { data, error } = await supabase()
    .from("payments")
    .insert(payment)
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function deletePayment(id: string) {
  const { error } = await supabase()
    .from("payments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// HOUSEKEEPING
// ═══════════════════════════════════════════════════════════════

export async function getHousekeepingTasks() {
  const { data, error } = await supabase()
    .from("housekeeping_tasks")
    .select("*, room:rooms(number, name), assignee:profiles(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (HousekeepingTask & { room: { number: string; name: string }; assignee: { full_name: string } | null })[];
}

export async function createHousekeepingTask(task: Omit<HousekeepingTask, "id" | "created_at" | "completed_at" | "room" | "assignee">) {
  const { data, error } = await supabase()
    .from("housekeeping_tasks")
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data as HousekeepingTask;
}

export async function updateHousekeepingStatus(id: string, status: HousekeepingTask["status"]) {
  const updates: Record<string, unknown> = { status };
  if (status === "COMPLETED") updates.completed_at = new Date().toISOString();
  const { error } = await supabase()
    .from("housekeeping_tasks")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteHousekeepingTask(id: string) {
  const { error } = await supabase()
    .from("housekeeping_tasks")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// COMPLAINTS
// ═══════════════════════════════════════════════════════════════

export async function getComplaints() {
  const { data, error } = await supabase()
    .from("complaints")
    .select("*, guest:guests(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as (Complaint & { guest: { full_name: string } | null })[];
}

export async function createComplaint(complaint: Omit<Complaint, "id" | "created_at" | "resolved_at" | "guest">) {
  const { data, error } = await supabase()
    .from("complaints")
    .insert(complaint)
    .select()
    .single();
  if (error) throw error;
  return data as Complaint;
}

export async function updateComplaint(id: string, updates: Partial<Omit<Complaint, "id" | "created_at" | "guest">>) {
  const { error } = await supabase()
    .from("complaints")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteComplaint(id: string) {
  const { error } = await supabase()
    .from("complaints")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════

export async function getInventoryItems() {
  const { data, error } = await supabase()
    .from("inventory_items")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as InventoryItem[];
}

export async function createInventoryItem(item: Omit<InventoryItem, "id" | "created_at">) {
  const { data, error } = await supabase()
    .from("inventory_items")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data as InventoryItem;
}

export async function updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, "id" | "created_at">>) {
  const { error } = await supabase()
    .from("inventory_items")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase()
    .from("inventory_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

export async function getEvents() {
  const { data, error } = await supabase()
    .from("events")
    .select("*, venue:venues(name)")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data as (Event & { venue: { name: string } | null })[];
}

export async function createEvent(event: Omit<Event, "id" | "created_at">) {
  const { data, error } = await supabase()
    .from("events")
    .insert(event)
    .select()
    .single();
  if (error) throw error;
  return data as Event;
}

export async function updateEvent(id: string, updates: Partial<Omit<Event, "id" | "created_at">>) {
  const { error } = await supabase()
    .from("events")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase()
    .from("events")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════════

export async function getFinanceRecords() {
  const { data, error } = await supabase()
    .from("finance_records")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data as FinanceRecord[];
}

export async function createFinanceRecord(record: Omit<FinanceRecord, "id" | "created_at">) {
  const { data, error } = await supabase()
    .from("finance_records")
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  return data as FinanceRecord;
}

export async function deleteFinanceRecord(id: string) {
  const { error } = await supabase()
    .from("finance_records")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// PROFILES / EMPLOYEES
// ═══════════════════════════════════════════════════════════════

export async function getProfiles() {
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return data as Profile[];
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return null;
  const { data } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

export async function updateProfile(id: string, updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>) {
  const { error } = await supabase()
    .from("profiles")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// VENUES
// ═══════════════════════════════════════════════════════════════

export async function getVenues() {
  const { data, error } = await supabase()
    .from("venues")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as { id: string; name: string; description: string | null; capacity: number; price_per_day: number; amenities: string[]; is_available: boolean }[];
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD STATS (aggregated)
// ═══════════════════════════════════════════════════════════════

export async function getDashboardStats() {
  const sb = supabase();
  const today = new Date().toISOString().split("T")[0];

  const [roomsRes, bookingsRes, paymentsRes, complaintsRes, housekeepingRes] = await Promise.all([
    sb.from("rooms").select("status"),
    sb.from("bookings").select("status, check_in, check_out, total_amount, paid_amount"),
    sb.from("payments").select("amount, status, created_at").eq("status", "COMPLETED"),
    sb.from("complaints").select("status").in("status", ["OPEN", "IN_PROGRESS"]),
    sb.from("housekeeping_tasks").select("status").in("status", ["PENDING"]),
  ]);

  const rooms = roomsRes.data || [];
  const bookings = bookingsRes.data || [];
  const payments = paymentsRes.data || [];
  const complaints = complaintsRes.data || [];
  const housekeeping = housekeepingRes.data || [];

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r) => r.status === "OCCUPIED").length;
  const available = rooms.filter((r) => r.status === "AVAILABLE").length;
  const cleaning = rooms.filter((r) => r.status === "CLEANING").length;
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length;

  const checkInsToday = bookings.filter((b) => b.check_in === today && (b.status === "CONFIRMED" || b.status === "PENDING")).length;
  const checkOutsToday = bookings.filter((b) => b.check_out === today && b.status === "CHECKED_IN").length;
  const activeBookings = bookings.filter((b) => ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(b.status)).length;
  const pendingPayments = bookings.filter((b) => b.paid_amount < b.total_amount && ["CONFIRMED", "CHECKED_IN"].includes(b.status)).length;

  const todayPayments = payments.filter((p) => p.created_at?.startsWith(today));
  const incomeToday = todayPayments.reduce((s, p) => s + Number(p.amount), 0);

  const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  return {
    totalRooms,
    occupiedRooms: occupied,
    availableRooms: available,
    cleaningRooms: cleaning,
    maintenanceRooms: maintenance,
    bookingsToday: activeBookings,
    expectedCheckIns: checkInsToday,
    expectedCheckOuts: checkOutsToday,
    pendingPayments,
    incomeToday,
    openComplaints: complaints.length,
    dirtyRooms: housekeeping.length,
    occupancyRate,
    roomStatusData: [
      { status: "AVAILABLE", count: available },
      { status: "OCCUPIED", count: occupied },
      { status: "CLEANING", count: cleaning },
      { status: "MAINTENANCE", count: maintenance },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// BOOKING API (public - for website booking form)
// ═══════════════════════════════════════════════════════════════

export interface CreateBookingFromWebsite {
  guest: {
    full_name: string;
    email: string;
    phone: string;
    id_type?: string;
    id_number?: string;
    nationality?: string;
  };
  booking: {
    check_in: string;
    check_out: string;
    nights: number;
    adults: number;
    children: number;
    total_amount: number;
    booking_type: "INDIVIDUAL" | "GROUP";
    special_requests?: string;
    hall_id?: string;
    hall_days?: number;
    hall_amount?: number;
    room_ids?: string[];
  };
}
