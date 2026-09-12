// The customer's custom-drink selections. Client-safe (no server imports): the
// cart stores it, the wizard builds it, and checkout re-prices from it server-side.

export type CustomConfig = {
  /** The chosen size = a variation id of the custom product (carries base price). */
  sizeId: string;
  sugarFree: boolean;
  baseId: string;
  syrupIds: string[];
  /** Included creams/toppings (free). */
  toppingIds: string[];
  caffeine: boolean;
  electrolytes: boolean;
  /** A custom_milks id, or null for no milk. */
  milkId: string | null;
  /**
   * Set when this build started from a predefined item's "Customize" button.
   * The SERVER re-derives the free-flavor threshold from that product's recipe
   * and constrains the base to its category — never trust the client for either.
   */
  recipeProductId?: string;
};

// A predefined item's structured recipe — turns a menu drink into a pre-filled
// custom build. The BASE is inherited from the item's category (categories.baseIds:
// 1 = fixed; 2+ = the customer picks one first). The recipe itself is just the
// included flavors (syrupIds — set the free count; extras cost per-syrup) and the
// included creams/toppings (toppingIds — free).
export type ProductRecipe = {
  syrupIds: string[];
  toppingIds: string[];
};

// Shapes the storefront wizard consumes (kept here so client components don't
// import the server-only lib/custom-drink module).
export type CustomSize = { id: string; name: string; priceCents: number };
export type CustomVariant = {
  id: string;
  name: string;
  availableRegular: boolean;
  availableSugarFree: boolean;
};
export type CustomDrinkData = {
  sizes: CustomSize[];
  bases: CustomVariant[];
  syrups: CustomVariant[];
  /** Creams & toppings pool — free, no style restriction. */
  toppings: { id: string; name: string }[];
  milks: { id: string; name: string }[];
  pricing: {
    freeSyrups: number;
    maxSyrups: number;
    syrupCents: number;
    caffeineCents: number;
    electrolyteCents: number;
    milkCents: number;
  };
};

// Passed to the wizard when a predefined item is being customized. The base is
// inherited from the item's category: one id locks it; two-or-more makes the
// customer pick one before the wizard proceeds.
export type CustomPrefill = {
  productId: string;
  productName: string;
  baseIds: string[];
  syrupIds: string[];
  toppingIds: string[];
};
