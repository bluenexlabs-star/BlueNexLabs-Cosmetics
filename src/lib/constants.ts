export const CATEGORIES = [
  {
    slug: "hydration",
    name: "Hydration & Moisture",
    shortName: "Hydration",
    blurb: "Humectants, essences, and moisture-binding skin-care ingredients.",
  },
  {
    slug: "barrier",
    name: "Barrier & Recovery",
    shortName: "Skin Barrier",
    blurb: "Ceramides, lipids, and formulas that support a calm, resilient barrier.",
  },
  {
    slug: "brightening",
    name: "Brightening & Glow",
    shortName: "Brightening",
    blurb: "Tone, radiance, and even-looking complexion ingredients.",
  },
  {
    slug: "aging",
    name: "Firming & Age Care",
    shortName: "Age Care",
    blurb: "Texture, firmness, and visible-age support for daily routines.",
  },
  {
    slug: "cleansing",
    name: "Cleanse & Prep",
    shortName: "Cleanse",
    blurb: "Gentle cleansers and first-step prep for Korean skin-care routines.",
  },
  {
    slug: "other",
    name: "Tools & Essentials",
    shortName: "Essentials",
    blurb: "Accessories and supporting staples for at-home skin care.",
  },
] as const;

export const ALL_CATALOG_SLUG = "all";

export const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting Interac",
  paid: "Paid",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SITE = {
  name: "BlueNex Labs",
  legal: "BlueNexLabs Inc.",
  city: "Burnaby, British Columbia",
  address: "4309 Canada Way, Burnaby, BC V5G 1J3",
  email: "BlueNexLabs@gmail.com",
  hours: "Monday–Friday, 9:00–17:00 PT",
  interacEmail: process.env.INTERAC_EMAIL ?? "BlueNexLabs@gmail.com",
};
