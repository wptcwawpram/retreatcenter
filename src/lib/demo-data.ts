// ─── Demo Data for Dashboard ──────────────────────────────────────────────
// Realistic mock data for the management dashboard. Replace with DB queries later.

export const DEMO_ROOMS = [
  { id: "r1", number: "101", type: "TWO_IN_ONE", floor: 1, building: "Main Block", status: "OCCUPIED", price: 150, guestName: "Rev. Kwame Mensah" },
  { id: "r2", number: "102", type: "TWO_IN_ONE", floor: 1, building: "Main Block", status: "OCCUPIED", price: 150, guestName: "Deaconess Abena Darko" },
  { id: "r3", number: "103", type: "FOUR_IN_ONE", floor: 1, building: "Main Block", status: "AVAILABLE", price: 200, guestName: null },
  { id: "r4", number: "104", type: "FOUR_IN_ONE", floor: 1, building: "Main Block", status: "DIRTY", price: 200, guestName: null },
  { id: "r5", number: "105", type: "SIX_IN_ONE", floor: 1, building: "Main Block", status: "OCCUPIED", price: 270, guestName: "Grace Assembly Youth" },
  { id: "r6", number: "106", type: "SIX_IN_ONE", floor: 1, building: "Main Block", status: "CLEANING", price: 270, guestName: null },
  { id: "r7", number: "201", type: "TWO_IN_ONE", floor: 2, building: "Main Block", status: "AVAILABLE", price: 150, guestName: null },
  { id: "r8", number: "202", type: "TWO_IN_ONE", floor: 2, building: "Main Block", status: "MAINTENANCE", price: 150, guestName: null },
  { id: "r9", number: "203", type: "FOUR_IN_ONE", floor: 2, building: "Main Block", status: "AVAILABLE", price: 200, guestName: null },
  { id: "r10", number: "204", type: "FOUR_IN_ONE", floor: 2, building: "Main Block", status: "OCCUPIED", price: 200, guestName: "Elder Joseph Appiah" },
  { id: "r11", number: "301", type: "SUITE_FAN", floor: 3, building: "Main Block", status: "OCCUPIED", price: 350, guestName: "Pastor Ama Boateng" },
  { id: "r12", number: "302", type: "SUITE_AC", floor: 3, building: "Main Block", status: "AVAILABLE", price: 750, guestName: null },
  { id: "r13", number: "303", type: "SUITE_AC", floor: 3, building: "Main Block", status: "OCCUPIED", price: 750, guestName: "Dr. Yaw Asante" },
  { id: "r14", number: "HFA", type: "APARTMENT", floor: 1, building: "Holy Family Wing", status: "AVAILABLE", price: 750, guestName: null },
  { id: "r15", number: "A01", type: "TWO_IN_ONE", floor: 1, building: "Annex", status: "AVAILABLE", price: 160, guestName: null },
  { id: "r16", number: "A02", type: "THREE_IN_ONE", floor: 1, building: "Annex", status: "OCCUPIED", price: 270, guestName: "Faith Chapel Team" },
];

export const DEMO_BOOKINGS = [
  {
    id: "b1", reference: "WPTC-2026-0421", guestName: "Rev. Kwame Mensah", guestPhone: "+233 265 159 131",
    rooms: ["101", "102"], checkIn: "2026-05-10", checkOut: "2026-05-14", nights: 4,
    status: "CHECKED_IN", totalAmount: 1200, paidAmount: 1200, guests: 2, createdAt: "2026-05-08",
  },
  {
    id: "b2", reference: "WPTC-2026-0422", guestName: "Grace Assembly Youth", guestPhone: "+233 244 590 013",
    rooms: ["105"], checkIn: "2026-05-11", checkOut: "2026-05-13", nights: 2,
    status: "CHECKED_IN", totalAmount: 540, paidAmount: 540, guests: 6, createdAt: "2026-05-05",
  },
  {
    id: "b3", reference: "WPTC-2026-0423", guestName: "Pastor Ama Boateng", guestPhone: "+233 546 802 414",
    rooms: ["301"], checkIn: "2026-05-10", checkOut: "2026-05-12", nights: 2,
    status: "CHECKED_IN", totalAmount: 700, paidAmount: 350, guests: 1, createdAt: "2026-05-07",
  },
  {
    id: "b4", reference: "WPTC-2026-0424", guestName: "Dr. Yaw Asante", guestPhone: "+233 200 111 222",
    rooms: ["303"], checkIn: "2026-05-15", checkOut: "2026-05-18", nights: 3,
    status: "CONFIRMED", totalAmount: 2250, paidAmount: 675, guests: 2, createdAt: "2026-05-12",
  },
  {
    id: "b5", reference: "WPTC-2026-0425", guestName: "Faith Chapel Retreat", guestPhone: "+233 300 444 555",
    rooms: ["A02"], checkIn: "2026-05-12", checkOut: "2026-05-15", nights: 3,
    status: "CHECKED_IN", totalAmount: 810, paidAmount: 810, guests: 3, createdAt: "2026-05-10",
  },
  {
    id: "b6", reference: "WPTC-2026-0426", guestName: "Elder Joseph Appiah", guestPhone: "+233 555 666 777",
    rooms: ["204"], checkIn: "2026-05-16", checkOut: "2026-05-18", nights: 2,
    status: "PENDING", totalAmount: 400, paidAmount: 0, guests: 2, createdAt: "2026-05-14",
  },
  {
    id: "b7", reference: "WPTC-2026-0427", guestName: "Deaconess Abena Darko", guestPhone: "+233 277 888 999",
    rooms: ["102"], checkIn: "2026-05-08", checkOut: "2026-05-10", nights: 2,
    status: "CHECKED_OUT", totalAmount: 300, paidAmount: 300, guests: 1, createdAt: "2026-05-06",
  },
  {
    id: "b8", reference: "WPTC-2026-0428", guestName: "Bethel Church Conference", guestPhone: "+233 244 111 333",
    rooms: ["103", "201", "209"], checkIn: "2026-05-20", checkOut: "2026-05-23", nights: 3,
    status: "CONFIRMED", totalAmount: 1650, paidAmount: 500, guests: 8, createdAt: "2026-05-15",
  },
];

export const DEMO_GUESTS = [
  { id: "g1", firstName: "Kwame", lastName: "Mensah", phone: "+233 265 159 131", email: "kwame.mensah@gmail.com", idType: "Ghana Card", idNumber: "GHA-XXXX-1234", nationality: "Ghanaian", totalBookings: 5, lastVisit: "2026-05-10" },
  { id: "g2", firstName: "Ama", lastName: "Boateng", phone: "+233 546 802 414", email: "ama.boateng@yahoo.com", idType: "Ghana Card", idNumber: "GHA-XXXX-5678", nationality: "Ghanaian", totalBookings: 3, lastVisit: "2026-05-10" },
  { id: "g3", firstName: "Yaw", lastName: "Asante", phone: "+233 200 111 222", email: "dr.asante@hospital.gh", idType: "Passport", idNumber: "G1234567", nationality: "Ghanaian", totalBookings: 2, lastVisit: "2026-05-15" },
  { id: "g4", firstName: "Abena", lastName: "Darko", phone: "+233 277 888 999", email: "abena.darko@gmail.com", idType: "Ghana Card", idNumber: "GHA-XXXX-9012", nationality: "Ghanaian", totalBookings: 1, lastVisit: "2026-05-08" },
  { id: "g5", firstName: "Joseph", lastName: "Appiah", phone: "+233 555 666 777", email: "j.appiah@church.org", idType: "Driver License", idNumber: "DL-987654", nationality: "Ghanaian", totalBookings: 4, lastVisit: "2026-05-16" },
  { id: "g6", firstName: "Grace", lastName: "Assembly (Group)", phone: "+233 244 590 013", email: "admin@graceassembly.gh", idType: "N/A", idNumber: "N/A", nationality: "Ghanaian", totalBookings: 6, lastVisit: "2026-05-11" },
];

export const DEMO_PAYMENTS = [
  { id: "p1", receiptNo: "RCP-001", bookingRef: "WPTC-2026-0421", guestName: "Rev. Kwame Mensah", amount: 1200, method: "MOBILE_MONEY", status: "COMPLETED", date: "2026-05-08", note: "Full payment" },
  { id: "p2", receiptNo: "RCP-002", bookingRef: "WPTC-2026-0422", guestName: "Grace Assembly Youth", amount: 540, method: "BANK_TRANSFER", status: "COMPLETED", date: "2026-05-05", note: "Group payment" },
  { id: "p3", receiptNo: "RCP-003", bookingRef: "WPTC-2026-0423", guestName: "Pastor Ama Boateng", amount: 350, method: "CASH", status: "COMPLETED", date: "2026-05-07", note: "50% deposit" },
  { id: "p4", receiptNo: "RCP-004", bookingRef: "WPTC-2026-0424", guestName: "Dr. Yaw Asante", amount: 675, method: "MOBILE_MONEY", status: "COMPLETED", date: "2026-05-12", note: "30% deposit" },
  { id: "p5", receiptNo: "RCP-005", bookingRef: "WPTC-2026-0425", guestName: "Faith Chapel Retreat", amount: 810, method: "CASH", status: "COMPLETED", date: "2026-05-10", note: "Full payment" },
  { id: "p6", receiptNo: "RCP-006", bookingRef: "WPTC-2026-0428", guestName: "Bethel Church Conference", amount: 500, method: "BANK_TRANSFER", status: "COMPLETED", date: "2026-05-15", note: "Partial deposit" },
  { id: "p7", receiptNo: "RCP-007", bookingRef: "WPTC-2026-0423", guestName: "Pastor Ama Boateng", amount: 350, method: "CASH", status: "PENDING", date: "2026-05-12", note: "Balance due" },
];

export const DEMO_HOUSEKEEPING = [
  { id: "h1", roomNumber: "104", building: "Main Block", priority: 2, status: "PENDING", assignedTo: "Akosua Mensah", notes: "Check-out clean", createdAt: "2026-05-18T08:00:00" },
  { id: "h2", roomNumber: "106", building: "Main Block", priority: 1, status: "IN_PROGRESS", assignedTo: "Yaa Asantewaa", notes: "Regular clean", createdAt: "2026-05-18T07:30:00" },
  { id: "h3", roomNumber: "202", building: "Main Block", priority: 3, status: "PENDING", assignedTo: null, notes: "Maintenance — leaking tap reported", createdAt: "2026-05-17T14:00:00" },
  { id: "h4", roomNumber: "201", building: "Main Block", priority: 1, status: "COMPLETED", assignedTo: "Akosua Mensah", notes: "Ready for inspection", createdAt: "2026-05-18T06:00:00" },
];

export const DEMO_COMPLAINTS = [
  { id: "c1", guestName: "Rev. Kwame Mensah", roomNumber: "101", category: "PLUMBING", description: "Low water pressure in bathroom", status: "IN_PROGRESS", priority: 2, createdAt: "2026-05-12", assignedTo: "Kofi Maintenance" },
  { id: "c2", guestName: "Grace Assembly Youth", roomNumber: "105", category: "AC_FANS", description: "Ceiling fan making noise", status: "PENDING", priority: 1, createdAt: "2026-05-13", assignedTo: null },
  { id: "c3", guestName: "Pastor Ama Boateng", roomNumber: "301", category: "ELECTRICAL", description: "Power socket not working near desk", status: "RESOLVED", priority: 2, createdAt: "2026-05-11", assignedTo: "Kofi Maintenance" },
];

export const DEMO_FINANCE = [
  { id: "f1", type: "INCOME", category: "Room Revenue", description: "Booking WPTC-2026-0421", amount: 1200, date: "2026-05-08" },
  { id: "f2", type: "INCOME", category: "Room Revenue", description: "Booking WPTC-2026-0422", amount: 540, date: "2026-05-05" },
  { id: "f3", type: "INCOME", category: "Room Revenue", description: "Booking WPTC-2026-0425", amount: 810, date: "2026-05-10" },
  { id: "f4", type: "INCOME", category: "Hall Revenue", description: "Faith Hall booking — Bethel Church", amount: 550, date: "2026-05-14" },
  { id: "f5", type: "INCOME", category: "Cafeteria", description: "Meals — Week 2", amount: 2400, date: "2026-05-12" },
  { id: "f6", type: "EXPENSE", category: "Utilities", description: "ECG electricity bill — May", amount: 1800, date: "2026-05-05" },
  { id: "f7", type: "EXPENSE", category: "Supplies", description: "Cleaning supplies restock", amount: 450, date: "2026-05-10" },
  { id: "f8", type: "EXPENSE", category: "Maintenance", description: "Plumbing repairs — Room 202", amount: 320, date: "2026-05-17" },
  { id: "f9", type: "EXPENSE", category: "Fuel", description: "Generator diesel — 100L", amount: 1500, date: "2026-05-15" },
  { id: "f10", type: "INCOME", category: "Laundry", description: "Laundry services — Week 2", amount: 380, date: "2026-05-13" },
];

export const DEMO_EMPLOYEES = [
  { id: "e1", name: "Admin WPTC", role: "SUPER_ADMIN", phone: "+233 265 159 131", email: "admin@wptc.gh", status: "Active" },
  { id: "e2", name: "Akosua Mensah", role: "HOUSEKEEPER", phone: "+233 244 111 222", email: "akosua@wptc.gh", status: "Active" },
  { id: "e3", name: "Yaa Asantewaa", role: "HOUSEKEEPER", phone: "+233 244 333 444", email: "yaa@wptc.gh", status: "Active" },
  { id: "e4", name: "Kofi Maintenance", role: "MAINTENANCE", phone: "+233 244 555 666", email: "kofi@wptc.gh", status: "Active" },
  { id: "e5", name: "Mary Receptionist", role: "RECEPTIONIST", phone: "+233 546 802 414", email: "mary@wptc.gh", status: "Active" },
  { id: "e6", name: "Esi Accountant", role: "ACCOUNTANT", phone: "+233 244 777 888", email: "esi@wptc.gh", status: "Active" },
];
