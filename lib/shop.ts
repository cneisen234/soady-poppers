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
  kettleCorn: "Big Poppa's Kettle Corn",
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

// ---- Hours ----
// 0 = Sunday … 6 = Saturday. open/close are 24h decimal hours in local time.
// null = closed that day.
export type DayHours = { open: number; close: number } | null;

export const hours: Record<number, DayHours> = {
  0: null, // Sun — closed
  1: { open: 7, close: 17 }, // Mon
  2: { open: 7, close: 17 }, // Tue
  3: { open: 7, close: 17 }, // Wed
  4: { open: 7, close: 17 }, // Thu
  5: { open: 7, close: 20 }, // Fri
  6: { open: 10, close: 20 }, // Sat
};

export const hoursDisplay: { label: string; value: string; closed?: boolean }[] = [
  { label: "Monday", value: "7 AM – 5 PM" },
  { label: "Tuesday", value: "7 AM – 5 PM" },
  { label: "Wednesday", value: "7 AM – 5 PM" },
  { label: "Thursday", value: "7 AM – 5 PM" },
  { label: "Friday", value: "7 AM – 8 PM" },
  { label: "Saturday", value: "10 AM – 8 PM" },
  { label: "Sunday", value: "Closed", closed: true },
];

// ---- Menu ----
export type DrinkItem = { name: string; desc: string; note?: string };
export type Accent = "pink" | "teal" | "lemon" | "magenta" | "lime";
export type MenuGroup = { title: string; accent: Accent; items: DrinkItem[] };
export type PriceTier = { label: string; detail: string; price: string };

// The shop's #1 seller — an Orange Oasis dirty soda.
export const topSeller = {
  name: "Orange You Glad",
  desc: "Orange soda · Vanilla · Cream · Cold Foam",
  category: "Dirty Soda · Orange Oasis",
  note: "",
};

// ---- Dirty Soda ----
export const dirtySoda = {
  id: "dirty-soda",
  label: "Dirty Soda",
  tagline: "",
  tiers: [
    { label: "Basic", detail: "16 oz", price: "$6" },
    { label: "Bougie", detail: "32 oz", price: "$8" },
  ] as PriceTier[],
  note: "",
  groups: [
    {
      title: "Coke Creations",
      accent: "magenta",
      items: [
        { name: "Love You Cherry Much", desc: "Cherry · Vanilla · Cold Foam" },
        { name: "Main Squeeze", desc: "Vanilla · Lime · Cream", note: "Available with Coconut" },
        { name: "Creamy Cutie", desc: "White Chocolate · Cream · Cold Foam" },
      ],
    },
    {
      title: "Mt. Dew Magic",
      accent: "lime",
      items: [
        { name: "Lime in Love", desc: "Lime · Vanilla · Cream · Cold Foam" },
        { name: "Griff's Pick", desc: "Pineapple · Green Apple · Cream" },
        { name: "Dew Got Me", desc: "Raspberry · Coconut · Cream · Cold Foam" },
      ],
    },
    {
      title: "Citrus Sips",
      accent: "lemon",
      items: [
        { name: "Blue Crush", desc: "Blue Raspberry · Vanilla · Cream" },
        { name: "Rainbow Riot", desc: "Raspberry · Orange · Lime · Vanilla · Cream" },
        { name: "Cherry Bombshell", desc: "Cherry · Lime · Vanilla · Cream · Cold Foam" },
        { name: "Watermelon Sugar", desc: "Watermelon · Strawberry · Cream · Cold Foam" },
      ],
    },
    {
      title: "Dr. Pepper Delights",
      accent: "pink",
      items: [
        { name: "Coco Crush", desc: "Vanilla · Coconut · Cream", note: "Available with Lime" },
        { name: "Midnight Crush", desc: "Blue Razz · Watermelon · Cream · Cold Foam" },
        { name: "Velvet Pepper", desc: "White Chocolate · Vanilla · Cream" },
        { name: "Pretty in Pink", desc: "Freeze-Dried Strawberries · Cupcake · White Chocolate · Cold Foam" },
      ],
    },
    {
      title: "Orange Oasis",
      accent: "teal",
      items: [
        { name: "Orange You Glad", desc: "Vanilla · Cream · Cold Foam" },
        { name: "Bedrock Baddie", desc: "Strawberry · White Chocolate Drizzle · Cream · Cold Foam · Cereal Topping" },
      ],
    },
  ] as MenuGroup[],
};

// ---- Fresh-Squeezed Lemonade ----
export const lemonade = {
  id: "lemonade",
  label: "Fresh-Squeezed Lemonade",
  tagline: "",
  tiers: [
    { label: "Classic", detail: "just lemonade", price: "$8" },
    { label: "Flavored", detail: "2 flavors", price: "$9" },
    { label: "Dirty", detail: "includes cream", price: "$10" },
  ] as PriceTier[],
  flavored: {
    title: "Flavored",
    accent: "lemon",
    items: [
      { name: "Berry Babe", desc: "Strawberry & Raspberry" },
      { name: "Blue Lagoon", desc: "Blue Raspberry + Coconut" },
      { name: "Electric Apple", desc: "Green Apple + Blue Raspberry" },
      { name: "Kiwi Kick", desc: "Kiwi & Lime" },
      { name: "Sunset Sipper", desc: "Passion Fruit + Orange" },
      { name: "Island Splash", desc: "Mango & Pineapple" },
      { name: "Summer Fling", desc: "Watermelon + Coconut" },
    ] as DrinkItem[],
  },
  dirty: {
    title: "Dirty (includes cream)",
    accent: "pink",
    items: [
      { name: "Lemon Bar Babe", desc: "Vanilla + Cream" },
      { name: "Peaches & Cream Dream", desc: "Peach + Vanilla + Cream" },
      { name: "Coconut Cloud", desc: "Coconut + Vanilla + Cream" },
      { name: "Tropic Like It's Hot", desc: "Pineapple + Coconut + Passion Fruit + Coconut Cream" },
      { name: "Pretty in Pink", desc: "Strawberry + Cupcake + Cream" },
      { name: "Watermelon Sugar Rush", desc: "Watermelon + Strawberry + Cream" },
      { name: "Pineapple Whip", desc: "Pineapple + White Chocolate + Cream" },
    ] as DrinkItem[],
  },
  note: "Custom flavor? Over 20 options — two flavors included, extras available.",
};

// ---- Energy refreshers ----
export const energyDrinks = {
  id: "energy",
  label: "Main Character Energy",
  tagline: "",
  tiers: [
    { label: "Basic", detail: "", price: "$8" },
    { label: "Bougie", detail: "", price: "$11" },
  ] as PriceTier[],
  items: [
    { name: "Pink Sunset", desc: "Strawberry · Passion Fruit · Cream · Cold Foam" },
    { name: "Blue Lightning Pop", desc: "Blue Razz · Lime · Cotton Candy · Cold Foam" },
    { name: "Rainbow Rush", desc: "Raspberry · Lime · Cream · Cold Foam" },
    { name: "Pink Cloud Energy", desc: "Peach · Strawberry · Cream · Cold Foam" },
    { name: "Berry Bliss", desc: "Berry · Vanilla · choice of Sweet, Coconut or Strawberry Cold Foam" },
  ] as DrinkItem[],
};

// ---- Sparkling-water refreshers ----
export const fizzyFix = {
  id: "fizzy",
  label: "Fizzy Fix",
  tagline: "",
  tiers: [
    { label: "Basic", detail: "", price: "$6" },
    { label: "Bougie", detail: "", price: "$8" },
  ] as PriceTier[],
  items: [
    { name: "Pink Sunset", desc: "Strawberry · Passion Fruit · Cream · Cold Foam" },
    { name: "Blue Lightning Pop", desc: "Blue Razz · Lime · Cotton Candy · Cold Foam" },
    { name: "Mango Tango", desc: "Mango · Tangerine · Lime · Kiwi · Cold Foam" },
    { name: "Apple Island Punch", desc: "Green Apple · Pineapple · Passion Fruit" },
  ] as DrinkItem[],
};

// ---- Lattes ----
export const lattes = {
  id: "lattes",
  label: "Not Feelin' Fizzy?",
  tagline: "",
  tiers: [
    { label: "Basic", detail: "", price: "$6" },
    { label: "Bougie", detail: "", price: "$8" },
  ] as PriceTier[],
  iced: {
    title: "Iced Lattes",
    flavors: ["Vanilla", "Caramel", "Dark Chocolate", "White Chocolate", "White Chocolate Raspberry"],
  },
  chai: {
    title: "Chai Lattes",
    flavors: ["Campfire Chai", "Brown Sugar Babe", "Chai It Your Way"],
  },
};

// ---- Popcorn — Big Poppa's Kettle Corn ----
export const popcorn = {
  id: "popcorn",
  label: "Big Poppa's Kettle Corn",
  tagline: "",
  flavors: ["Classic Kettle Corn", "Caramel", "Cheddar", "Rotating Gourmet Mixes"],
  note: "",
};

// Add-ons that apply across the board.
export const addOns = [
  "Coconut or Oat Milk",
  "Sugar-Free options",
  "Extra cold foam",
  "20+ custom flavors",
];

// Order in which the menu sections appear + their nav rail labels.
export const menuSections = [
  { id: dirtySoda.id, label: "Dirty Soda" },
  { id: lemonade.id, label: "Lemonade" },
  { id: energyDrinks.id, label: "Energy" },
  { id: fizzyFix.id, label: "Fizzy Fix" },
  { id: lattes.id, label: "Lattes" },
  { id: popcorn.id, label: "Popcorn" },
] as const;
