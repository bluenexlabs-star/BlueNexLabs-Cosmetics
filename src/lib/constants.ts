export const CATEGORIES = [
  {
    slug: "metabolic",
    name: "Metabolic & Appetite Signaling",
    shortName: "Weight Management",
    blurb: "Incretin and metabolic pathway research peptides.",
  },
  {
    slug: "cellular",
    name: "Biological & Cellular",
    shortName: "Repair & Rejuvenation",
    blurb: "Tissue, recovery, and cellular signaling research tools.",
  },
  {
    slug: "mitochondrial",
    name: "Cellular Energy & Mitochondrial",
    shortName: "Cellular Energy",
    blurb: "Mitochondrial and cellular energy research compounds.",
  },
  {
    slug: "ghs",
    name: "Growth Hormone Secretagogues",
    shortName: "Growth Hormone",
    blurb: "GHRH analogues and ghrelin-mimetic research peptides.",
  },
  {
    slug: "cognitive",
    name: "Cognitive & Neuroscience",
    shortName: "Cognitive Research",
    blurb: "Neuropeptides used in cognitive and sleep research models.",
  },
  {
    slug: "other",
    name: "Other Research Compounds",
    shortName: "Other Compounds",
    blurb: "Reconstitution supplies and additional laboratory materials.",
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
