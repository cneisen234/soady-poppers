// Drizzle schema — the single source of truth for our Postgres tables.
//
// Conventions:
//  - Money is always integer cents; tax rates are integer basis points (600 = 6%).
//  - We manage the catalog ourselves — there is no Square id on catalog rows. The
//    catalog import (scripts/import-menu.ts) wipes and reloads, so it needs no
//    natural key. (payments.square_payment_id stays: Square still processes payments.)
//  - Order rows SNAPSHOT names/prices/tax at purchase time, so editing an item or
//    the tax rate later never rewrites a past receipt.

import { sql, relations } from "drizzle-orm";
import type { WeekHours } from "@/lib/status";
import type { ProductRecipe } from "@/lib/custom-drink-types";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

// ---- Shared JSON shapes ----

export type DeliveryAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

// ---- Enums ----

export const orderStatus = pgEnum("order_status", [
  "new",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
  "refunded",
]);

export const fulfillmentMethod = pgEnum("fulfillment_method", [
  "pickup",
  "delivery",
  "shipping",
]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

// A coupon is either a percent off or a flat dollar amount off the subtotal.
export const couponKind = pgEnum("coupon_kind", ["percent", "fixed"]);

// ---- Catalog ----

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // The custom-drink base(s) for this category — items here are built on it.
  // Empty = not a customizable category (e.g. lattes). 1 = fixed base for all its
  // items; 2+ = the customer picks one first (Main Character Energy, Signature).
  baseIds: jsonb("base_ids").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description"),
    // Owner-facing controls:
    available: boolean("available").notNull().default(true), // pause an item
    hidden: boolean("hidden").notNull().default(false), // hide from storefront
    // The single seeded "Custom Drink" product. Its variations are the custom
    // drink's sizes/prices; managed in Settings → Custom Drink, not the item list,
    // and rendered on the storefront as the build-your-own wizard.
    isCustom: boolean("is_custom").notNull().default(false),
    // Structured recipe (base + syrups + toppings) for a customizable menu drink.
    // Null = not customizable (shows plain "Add", e.g. lattes). Drives the
    // "Customize" wizard, pre-filled with these ingredients.
    recipe: jsonb("recipe").$type<ProductRecipe>(),
    // Tax override: null = inherit the global settings rate, 0 = exempt,
    // any other value = a custom rate in basis points for this product.
    taxRateBps: integer("tax_rate_bps"),
    // Inventory: when trackInventory is on, `stock` is decremented on purchase
    // and the item reads as sold out at 0. When off, the item is always in stock.
    trackInventory: boolean("track_inventory").notNull().default(false),
    stock: integer("stock").notNull().default(0),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_sort_idx").on(t.sort),
  ],
);

export const variations = pgTable(
  "variations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceCents: integer("price_cents").notNull(),
    sku: text("sku"),
    available: boolean("available").notNull().default(true),
    soldOut: boolean("sold_out").notNull().default(false),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("variations_product_idx").on(t.productId)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    // UploadThing file key, for deletion when an image is replaced/removed.
    // Null for images seeded from Square (hosted on Square's CDN).
    utKey: text("ut_key"),
    alt: text("alt"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

// ---- Orders ----

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shortId: text("short_id").notNull(), // 8-char display id shown to customer + shop
    status: orderStatus("status").notNull().default("new"),
    method: fulfillmentMethod("method").notNull(),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email"),
    customerPhone: text("customer_phone"),
    address: jsonb("address").$type<DeliveryAddress>(),
    note: text("note"),
    subtotalCents: integer("subtotal_cents").notNull(),
    // Discount applied off the subtotal (0 when none) — either a vendor rate or a
    // coupon. Snapshotted here so editing/removing the source later never rewrites
    // a past receipt.
    discountCents: integer("discount_cents").notNull().default(0),
    // The coupon code that produced the discount, snapshotted (null when the
    // discount came from a vendor rate or there was none).
    couponCode: text("coupon_code"),
    taxCents: integer("tax_cents").notNull(),
    feeCents: integer("fee_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_short_id_key").on(t.shortId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    // Optional link back to the live variation (nulled if the item is later deleted).
    variationId: uuid("variation_id").references(() => variations.id, {
      onDelete: "set null",
    }),
    // Snapshots — frozen at purchase time:
    productName: text("product_name").notNull(),
    variationName: text("variation_name").notNull(),
    // For a custom drink: the built-to-order recipe the shop reads (base, flavors,
    // add-ons). Null for normal items. Server-built at checkout, never trusted.
    customSummary: text("custom_summary"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    qty: integer("qty").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    taxable: boolean("taxable").notNull().default(true),
    taxRateBps: integer("tax_rate_bps").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    squarePaymentId: text("square_payment_id"),
    status: paymentStatus("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_square_id_key").on(t.squarePaymentId),
    index("payments_order_idx").on(t.orderId),
  ],
);

// ---- Vendor discounts ----
// A whitelist of customer emails that get a standing percent-off. Matched on the
// email entered at checkout (case-insensitive; stored lowercased).
export const vendorDiscounts = pgTable(
  "vendor_discounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    // Discount in basis points off the subtotal (1000 = 10.00%).
    discountBps: integer("discount_bps").notNull(),
    label: text("label"), // optional note, e.g. the vendor's name
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("vendor_discounts_email_key").on(t.email)],
);

// ---- Coupons ----
// Promo codes a customer types at checkout for a percent-off. Like vendor
// discounts, but keyed on a code the customer enters (case-insensitive; stored
// uppercased) instead of their email, and switchable on/off without deleting.
export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    // "percent" -> discountBps applies; "fixed" -> amountOffCents applies.
    kind: couponKind("kind").notNull().default("percent"),
    // Percent-off in basis points off the subtotal (1000 = 10.00%). Used when
    // kind = "percent" (0 for fixed coupons).
    discountBps: integer("discount_bps").notNull().default(0),
    // Flat amount off the subtotal, in cents. Used when kind = "fixed".
    amountOffCents: integer("amount_off_cents"),
    active: boolean("active").notNull().default(true),
    label: text("label"), // optional note, e.g. the promotion's name
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("coupons_code_key").on(t.code)],
);

// ---- Custom drink builder option pools ----
// The bases, syrups, and milk options a customer can pick in the custom-drink
// wizard. Curated as separate lists in the admin (Settings → Custom Drink). The
// pricing rules for them live on the settings row (addon*/custom* columns).

export const customBases = pgTable("custom_bases", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // Like syrups: a base is offered regular and/or sugar-free. The drink-level
  // sugar-free choice filters the base list to the matching variant.
  availableRegular: boolean("available_regular").notNull().default(true),
  availableSugarFree: boolean("available_sugar_free").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customSyrups = pgTable("custom_syrups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // One row per flavor, offered regular and/or sugar-free (like a size, limited to
  // those two). The customer picks regular or sugar-free at checkout.
  availableRegular: boolean("available_regular").notNull().default(true),
  availableSugarFree: boolean("available_sugar_free").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customMilks = pgTable("custom_milks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Creams & toppings (cold foam, cream, cereal topping, …) — included free on a
// recipe; a customer can add/swap them in the wizard at no charge.
export const customToppings = pgTable("custom_toppings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- Settings (single row) ----

export const settings = pgTable(
  "settings",
  {
    id: integer("id").primaryKey().default(1),
    acceptingOrders: boolean("accepting_orders").notNull().default(true),
    pausedMessage: text("paused_message"),
    // Global default tax rate in basis points (600 = 6.00%). Per-product overrides
    // live on products.tax_rate_bps.
    taxRateBps: integer("tax_rate_bps").notNull().default(600),
    // Delivery fee tiers (parameterizes lib/fulfillment.ts):
    //   under `flatMinItems`     -> perItem cents each
    //   flatMinItems..freeMin-1  -> flat cents
    //   freeMinItems and up      -> free
    deliveryPerItemCents: integer("delivery_per_item_cents").notNull().default(200),
    deliveryFlatCents: integer("delivery_flat_cents").notNull().default(500),
    deliveryFlatMinItems: integer("delivery_flat_min_items").notNull().default(5),
    deliveryFreeMinItems: integer("delivery_free_min_items").notNull().default(10),
    // Custom drink builder + add-on pricing. (The custom drink's base price comes
    // from its size/variation, like any product — not from here.)
    //   customFreeSyrups       -> syrups included before the per-syrup fee starts
    //   customMaxSyrups        -> hard cap on syrups in a custom drink
    //   addonSyrupCents        -> price per extra syrup (custom beyond free, and on
    //                             predefined drinks)
    //   addonCaffeineCents     -> caffeine add-on (always charged, any drink)
    //   addonElectrolyteCents  -> electrolyte add-on (always charged, any drink)
    //   addonMilkCents         -> milk alternative (oat / coconut)
    customFreeSyrups: integer("custom_free_syrups").notNull().default(2),
    customMaxSyrups: integer("custom_max_syrups").notNull().default(5),
    addonSyrupCents: integer("addon_syrup_cents").notNull().default(50),
    addonCaffeineCents: integer("addon_caffeine_cents").notNull().default(100),
    addonElectrolyteCents: integer("addon_electrolyte_cents").notNull().default(100),
    addonMilkCents: integer("addon_milk_cents").notNull().default(50),
    hours: jsonb("hours").$type<WeekHours>(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("settings_singleton", sql`${t.id} = 1`)],
);

// ---- Relations (enable db.query with nested `with`) ----

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variations: many(variations),
  images: many(productImages),
}));

export const variationsRelations = relations(variations, ({ one }) => ({
  product: one(products, {
    fields: [variations.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));
