// Central source of truth for Soady Poppers Soda Pop Shop.
// Facts, hours + the full menu are transcribed from the shop's own menu boards,
// hours flyer, cups and Facebook page.
//
// Soady Poppers is a walk-in shop — everything is made fresh to order at the
// counter. They do NOT take phone orders and do NOT deliver.
//
// NOTE — confirm with the owners before launch:
//  • the phone number for general questions — the drink menu lists 989-889-9488;
//    the hours flyer lists 231-942-0104. Both are kept below.
//  • popcorn flavors + pricing (Big Poppa's is hand-bagged; no price board yet).

export const shop = {
  name: "Soady Poppers",
  fullName: "Soady Poppers Soda Pop Shop",
  town: "Fairview, Michigan",
  address: "2051 E Miller Rd",
  cityStateZip: "Fairview, MI 48621",
  tagline: "",
  blurb:
    "A family-run soda pop shop in Fairview, Michigan — hand-crafted dirty sodas, fresh-squeezed lemonade, energy refreshers and Big Poppa's gourmet kettle corn. Made fresh at the counter. Come on in!",

  // Phone for general questions (not for ordering — Soady Poppers is walk-in only)
  phone: "(989) 889-9488",
  phoneHref: "tel:+19898899488",
  // Secondary line (from the hours flyer)
  phoneAlt: "(231) 942-0104",
  phoneAltHref: "tel:+12319420104",

  town_short: "Fairview, MI",

  facebook: "https://www.facebook.com/soadypoppers/",
  facebookLabel: "Soady Poppers",
  tiktokLabel: "Follow us on TikTok",

  // Keyless search + embeddable map (works without a Google API key).
  // Lead with the business name so Google labels the pin "Soady Poppers".
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Soady+Poppers,+2051+E+Miller+Rd,+Fairview,+MI+48621",
  mapsEmbed:
    "https://www.google.com/maps?q=Soady+Poppers,+2051+E+Miller+Rd,+Fairview,+MI+48621&output=embed",
} as const;

// Hours live in the DB now (settings.hours) — see lib/status.ts + lib/settings.ts.

// ---- Menu ----
export type Accent = "pink" | "teal" | "lemon" | "magenta" | "lime";
export type PriceTier = { label: string; detail?: string; price: string };

// Thin presentation config for /menu. The actual drink names, descriptions,
// sizes and prices come from the DB catalog (lib/catalog.ts) — this only says how
// to GROUP and COLOR the DB categories into display sections, and price tiers are
// derived from the items themselves. Edit drinks in the admin; only touch this
// when you want to regroup, recolor, or reorder sections.
export type MenuGroupConfig = { category: string; accent: Accent; title?: string };
export type MenuSectionConfig = {
  id: string;
  eyebrow: string;
  title: string;
  tagline?: string;
  altBg?: boolean;
  groups: MenuGroupConfig[];
  note?: string;
};

// The shop's #1 seller — an Orange Oasis dirty soda.
export const topSeller = {
  name: "Orange You Glad",
  desc: "Orange soda · Vanilla · Cream · Cold Foam",
  category: "Dirty Soda · Orange Oasis",
  note: "",
};

// ---- Menu layout (grouping + colors only — drink data comes from the DB) ----
// Each section maps to one or more DB categories. Item names/descriptions/prices
// are pulled from the catalog at render time; price tiers are derived from the
// items. Section ids double as the on-page anchors used by `menuSections`.
export const menuLayout: MenuSectionConfig[] = [
  {
    id: "dirty-soda",
    eyebrow: "Loaded pop",
    title: "Dirty Soda",
    groups: [
      { category: "Coke Creations", accent: "magenta" },
      { category: "Mt. Dew Magic", accent: "lime" },
      { category: "Citrus Sips", accent: "lemon" },
      { category: "Dr. Pepper Delights", accent: "pink" },
      { category: "Orange Oasis", accent: "teal" },
    ],
  },
  {
    id: "lemonade",
    eyebrow: "Squeezed fresh",
    title: "Fresh-Squeezed Lemonade",
    altBg: true,
    groups: [
      { category: "Classic Lemonade", accent: "teal" },
      { category: "Flavored Lemonade", accent: "lemon" },
      { category: "Dirty Lemonade", accent: "pink" },
    ],
    note: "Custom flavor? Over 20 options — two flavors included, extras available.",
  },
  {
    id: "energy",
    eyebrow: "⚡ Made with energy drinks",
    title: "Main Character Energy",
    groups: [{ category: "Main Character Energy", accent: "teal" }],
  },
  {
    id: "fizzy",
    eyebrow: "Sparkling water base",
    title: "Fizzy Fix",
    altBg: true,
    groups: [{ category: "Fizzy Fix", accent: "pink" }],
  },
  {
    id: "lattes",
    eyebrow: "Not feelin' fizzy?",
    title: "Iced & Chai Lattes",
    groups: [
      { category: "Iced Lattes", accent: "lemon" },
      { category: "Chai Lattes", accent: "teal" },
    ],
  },
];

// ---- Popcorn — Big Poppa's Kettle Corn ----
// Big Poppa's is Soady Poppers' popcorn sub-brand — a neon hip-hop-grunge
// kettle corn line with its own look (see /big-poppas). Flavors + puns are
// transcribed from the shelf signage; confirm the full rotating list + pricing
// with the owners before adding a price board.
export const popcorn = {
  id: "popcorn",
  label: "Big Poppa's Kettle Corn",
  tagline:
    "Small-batch kettle corn with an attitude — popped fresh and hand-bagged right in the shop.",
  flavors: ["Original Kettle", "Caramel Apple", "Choco Cherry", "Big Apple"],
};

// ---- Big Poppa's Kettle Corn — the sub-brand page (/big-poppas) ----
export type Neon = "cyan" | "lime" | "pink" | "purple" | "yellow";
export type BpFlavor = { name: string; tag: string; desc: string; color: Neon };

export const bigPoppa = {
  name: "Big Poppa's",
  fullName: "Big Poppa's Kettle Corn",
  abbr: "BPKC",
  // Fresh Batch · Big Flavor — straight off the Elite Eats label.
  tagline: "Fresh Batch. Big Flavor.",
  blurb:
    "Kettle corn with an attitude — popped fresh in fresh batches, hand-bagged, and dialed up loud. Hip-hop grunge in a bag, straight out of the Soady Poppers shop in Fairview.",

  // Big Poppa's has its own Facebook, separate from the Soady Poppers page.
  facebook: "https://www.facebook.com/bpkettlecorn/",

  // The lineup, from the shop's flavor signs + the rotating small-batch board.
  flavors: [
    {
      name: "Original Kettle",
      tag: "The O.G.",
      desc: "The one that started it all — that perfect sweet-and-salty kettle crunch.",
      color: "yellow",
    },
    {
      name: "Caramel Apple",
      tag: "Fall in a bag",
      desc: "Crisp green apple wrapped in buttery caramel. Made with love, popped with attitude.",
      color: "lime",
    },
    {
      name: "Choco Cherry",
      tag: "Cherry oh, my wayward son!",
      desc: "Rich chocolate meets sweet cherry pop — a remix you didn't know you needed.",
      color: "pink",
    },
    {
      name: "Big Apple",
      tag: "Apple crisp in every crunch",
      desc: "Bright, tart apple candy coating with straight-up East-coast swagger.",
      color: "cyan",
    },
    {
      name: "Dill With It",
      tag: "Big dill energy",
      desc: "Tangy dill-ranch dusting over a salty kettle crunch. Pucker up, playa.",
      color: "purple",
    },
    {
      name: "Birthday Bash",
      tag: "Pop bottles + popcorn",
      desc: "Vanilla cake, rainbow sprinkles and enough sugar to start the whole party.",
      color: "yellow",
    },
    {
      name: "Bomb Pop",
      tag: "Red, white & boom",
      desc: "Cherry, lime and blue-razz layered up like the classic summer rocket pop.",
      color: "cyan",
    },
    {
      name: "S'mores",
      tag: "Campfire classic",
      desc: "Toasted marshmallow, milk chocolate and graham-cracker crunch in every bite.",
      color: "pink",
    },
    {
      name: "Caramel Cheddar",
      tag: "Best of both worlds",
      desc: "Sweet caramel corn tangled up with sharp cheddar — the Chicago-style mix.",
      color: "yellow",
    },
  ] as BpFlavor[],

  // The premium line — totally different register: black-and-gold, small-batch.
  elite: {
    name: "Elite Eats",
    sub: "Premium Popcorn Collection",
    tagline: "Fresh Batch · Big Flavor",
    desc:
      "The premium reserve. Loaded gourmet mixes — chocolate, nuts and caramel corn — hand-packed in fresh batches.",
  },
};

// Order in which the menu sections appear + their nav rail labels.
export const menuSections = [
  { id: "dirty-soda", label: "Dirty Soda" },
  { id: "lemonade", label: "Lemonade" },
  { id: "energy", label: "Energy" },
  { id: "fizzy", label: "Fizzy Fix" },
  { id: "lattes", label: "Lattes" },
  { id: popcorn.id, label: "Popcorn" },
] as const;
