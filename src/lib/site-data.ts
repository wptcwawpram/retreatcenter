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

// Updated effective 1st March 2026
export const ROOMS = [
  {
    name: "2 in 1 Room",
    slug: "2-in-1",
    price: 150,
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
    price: 200,
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
    price: 270,
    capacity: 6,
    beds: 6,
    description:
      "Perfect for larger groups, with 6 beds, washroom, and a built-in desk with seating. Ideal for church retreats and fellowships.",
    amenities: ["Washroom", "Built-in Desk", "Seating Area", "Reception Access", "Restaurant Access", "Room Service"],
    featured: false,
  },
  {
    name: "Suite (Fan)",
    slug: "suite-fan",
    price: 350,
    capacity: 2,
    beds: 2,
    description:
      "Enjoy a private washroom, mini kitchen, fridge, two beds, and a spacious hall with TV. A premium experience for discerning guests.",
    amenities: [
      "Fan",
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
    name: "Suite (AC)",
    slug: "suite-ac",
    price: 750,
    capacity: 2,
    beds: 2,
    description:
      "Our finest suite — relax in a spacious air-conditioned suite with washroom, mini kitchen, fridge, two beds, and a hall with TV.",
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
    price: 750,
    capacity: 6,
    beds: 3,
    description:
      "A self-contained three-bedroom family apartment with a furnished kitchen and living room. The ultimate in comfort and privacy for families and VIP guests.",
    amenities: [
      "3 Bedrooms",
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

// Additional rooms & facilities
export const ADDITIONAL_ROOMS = [
  { name: "2 in 1 (Additional)", price: 160, capacity: 2, beds: 2 },
  { name: "3 in 1 (Additional)", price: 270, capacity: 3, beds: 3 },
  { name: "Kitchen", price: 220, capacity: 1, beds: 0 },
  { name: "Hall", price: 350, capacity: 50, beds: 0 },
] as const;

// Updated effective 1st March 2026
export const HALLS = [
  {
    name: "Faith Hall 1 (Conference Hall)",
    description: "Our largest indoor venue for conferences, worship services, seminars, and major gatherings.",
    capacity: "200+",
    priceWithoutAC: 400,
    priceWithAC: 550,
  },
  {
    name: "Pavilion",
    description: "Open-air venue ideal for outdoor worship, weddings, and special ceremonies. Available with or without canopy covers.",
    capacity: "300+",
    priceWithCanopy: 900,
    priceWithoutCanopy: 700,
  },
  {
    name: "Kitchen & Dining Hall",
    description: "Fully equipped kitchen and spacious dining hall for communal meals. Pricing based on group size.",
    capacity: "55+",
    pricing: [
      { label: "55 persons and above", price: 500 },
      { label: "30 to 50 persons", price: 400 },
      { label: "Below 20 persons", price: 250 },
    ],
  },
] as const;

// Wedding grounds
export const WEDDING_GROUNDS_PRICE = 4000;
export const BREAKAGE_DEPOSIT = 500;

// Cafeteria menu - Updated effective 1st March 2026
export const CAFETERIA = {
  meals: [
    "Jollof Rice", "Plain Rice", "Curry Rice", "Irony Rice", "Waakye",
    "Spaghetti", "Red Red & Fish/Chicken", "Local Jollof Rice",
  ],
  mealWithChicken: 60,
  mealWithFish: 70,
  ampesi: 70,
  mealWithSoup: 80,
  breakfast: 40,
  breakfastNote: "Tea/Cocoa/Oats/Tom Brown/Koko Porridge with bread, eggs, or baked beans & vegies",
} as const;

// Laundry services
export const LAUNDRY = [
  { item: "Normal Shirt / Jeans / Trousers", price: 15 },
  { item: "Suit (set)", price: 30 },
  { item: "Straight Dress / Shirt", price: 15 },
  { item: "Kaba and Slit", price: 30 },
] as const;

// Contact numbers (updated)
export const CONTACT_NUMBERS = [
  "+233 265 159 131",
  "+233 546 802 414",
  "+233 244 590 013",
] as const;
