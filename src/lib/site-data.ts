// ─── Warriors Prayer Tower Complex - Site Content ──────────────────────────
// All real content from warriorsprayertowercomplex.com

export const SITE = {
  name: "Warriors Prayer Tower Complex",
  shortName: "WPTC",
  subtitle: "Daniels' Christian Centre",
  tagline: "A Serene Environment for Your Spiritual Upliftment",
  heroText:
    "A place to wait on God. A place for major and minor conferences. A family home away from home.",
  phone: "+233 546 802 414",
  email: "wptc.wawpram@gmail.com",
  address: "Atwima Boko, Kumasi",
  fullAddress: "Warriors Prayer Tower Complex (Daniels' Christian Retreat Centre), Atwima Boko – Kumasi, Ghana",
  copyright: `© ${new Date().getFullYear()} Warriors Prayer Tower Complex. All rights reserved.`,
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rooms", href: "/rooms" },
  { label: "Amenities", href: "/amenities" },
  { label: "Gallery", href: "/gallery" },
  { label: "Packages", href: "/packages" },
  { label: "Contact", href: "/contact" },
] as const;

export const SERVICES = [
  {
    title: "Chaplaincy",
    description: "Spiritual guidance and pastoral care available for all guests during your stay.",
    icon: "BookOpen",
  },
  {
    title: "Counselling",
    description: "Professional Christian counselling services to support your spiritual journey.",
    icon: "Heart",
  },
  {
    title: "Accommodation",
    description: "Comfortable rooms ranging from shared to executive suites for individuals and groups.",
    icon: "BedDouble",
  },
  {
    title: "Cafeteria",
    description: "Freshly prepared local and continental meals served in our dining area.",
    icon: "UtensilsCrossed",
  },
  {
    title: "Laundry",
    description: "Convenient laundry services to make your stay comfortable and hassle-free.",
    icon: "Shirt",
  },
  {
    title: "Back-up Power",
    description: "Uninterrupted power supply with backup generators for a seamless experience.",
    icon: "Zap",
  },
  {
    title: "Free Parking",
    description: "Spacious and secure parking available at no extra cost for all guests.",
    icon: "Car",
  },
] as const;

export const AMENITIES = [
  {
    title: "Accommodation",
    description: "Well-furnished rooms from shared dorms to executive suites with modern amenities.",
    icon: "BedDouble",
  },
  {
    title: "Serene Environment",
    description: "Peaceful, lush surroundings perfect for prayer, meditation, and spiritual renewal.",
    icon: "TreePine",
  },
  {
    title: "Kitchen",
    description: "Fully equipped kitchen facilities for self-catering or group meal preparation.",
    icon: "ChefHat",
  },
  {
    title: "Dining Area",
    description: "Spacious and comfortable dining hall for communal meals and fellowship.",
    icon: "UtensilsCrossed",
  },
  {
    title: "Store",
    description: "On-site convenience store for essential items and refreshments.",
    icon: "Store",
  },
  {
    title: "Common Room",
    description: "Shared space for relaxation, socializing, and informal group gatherings.",
    icon: "Sofa",
  },
  {
    title: "Faith Hall",
    description: "Large conference and worship hall for services, seminars, and major events.",
    icon: "Church",
  },
  {
    title: "Pavilion",
    description: "Open-air pavilion ideal for outdoor worship, weddings, and special ceremonies.",
    icon: "Tent",
  },
] as const;

export const ROOMS = [
  {
    name: "2 in 1 Room",
    slug: "2-in-1",
    price: 100,
    capacity: 2,
    beds: 2,
    description:
      "A comfortable space with 2 beds, washroom, and a built-in desk with seating. Perfect for couples or friends travelling together.",
    amenities: ["Washroom", "Built-in Desk", "Seating Area", "Reception Access", "Restaurant Access", "Room Service"],
    featured: false,
  },
  {
    name: "4 in 1 Room",
    slug: "4-in-1",
    price: 120,
    capacity: 4,
    beds: 4,
    description:
      "Designed for small groups, featuring 4 beds, washroom, and a built-in desk with seating. Great for youth groups and ministry teams.",
    amenities: ["Washroom", "Built-in Desk", "Seating Area", "Reception Access", "Restaurant Access", "Room Service"],
    featured: false,
  },
  {
    name: "6 in 1 Room",
    slug: "6-in-1",
    price: 140,
    capacity: 6,
    beds: 6,
    description:
      "Perfect for larger groups, with 6 beds, washroom, and a built-in desk with seating. Ideal for church retreats and fellowships.",
    amenities: ["Washroom", "Built-in Desk", "Seating Area", "Reception Access", "Restaurant Access", "Room Service"],
    featured: false,
  },
  {
    name: "8 in 1 Room",
    slug: "8-in-1",
    price: 160,
    capacity: 8,
    beds: 8,
    description:
      "Ideal for big groups, offering 8 beds, washroom, and a built-in desk with seating. Perfect for large ministry delegations.",
    amenities: ["Washroom", "Built-in Desk", "Seating Area", "Reception Access", "Restaurant Access", "Room Service"],
    featured: false,
  },
  {
    name: "Executive Suite 1",
    slug: "executive-suite-1",
    price: 250,
    capacity: 2,
    beds: 2,
    description:
      "Enjoy a private washroom, mini kitchen, fridge, two beds, and a spacious hall with TV. A premium experience for discerning guests.",
    amenities: [
      "Private Washroom",
      "Mini Kitchen",
      "Fridge",
      "TV & Hall",
      "Reception Access",
      "Restaurant Access",
      "Room Service",
    ],
    featured: true,
  },
  {
    name: "Executive Suite 2",
    slug: "executive-suite-2",
    price: 650,
    capacity: 2,
    beds: 2,
    description:
      "Our finest accommodation — relax in a spacious air-conditioned suite with washroom, mini kitchen, fridge, two beds, and a hall with TV.",
    amenities: [
      "Air Conditioning",
      "Private Washroom",
      "Mini Kitchen",
      "Fridge",
      "TV & Hall",
      "Reception Access",
      "Restaurant Access",
      "Room Service",
    ],
    featured: true,
  },
  {
    name: "Holy Family Apartment",
    slug: "holy-family-apartment",
    price: 700,
    capacity: 4,
    beds: 2,
    description:
      "A self-contained family apartment offering the ultimate in comfort and privacy. Ideal for families and VIP guests seeking an extended stay.",
    amenities: [
      "Air Conditioning",
      "Private Washroom",
      "Full Kitchen",
      "Fridge",
      "Living Room with TV",
      "Reception Access",
      "Restaurant Access",
      "Room Service",
    ],
    featured: true,
  },
] as const;

export const HALLS = [
  {
    name: "Faith Hall",
    description: "Our largest indoor venue for conferences, worship services, seminars, and major gatherings.",
    capacity: "200+",
  },
  {
    name: "Pavilion",
    description: "Open-air venue ideal for outdoor worship, weddings, and special ceremonies. Available with or without canopy covers.",
    capacity: "300+",
  },
  {
    name: "Common Room",
    description: "Intimate space perfect for small group meetings, bible studies, and counselling sessions.",
    capacity: "50+",
  },
] as const;
