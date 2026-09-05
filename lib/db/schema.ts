// Drizzle schema — the single source of truth for our Postgres tables.
//
// Conventions:
//  - Money is always integer cents; tax rates are integer basis points (600 = 6%).
//  - We manage the catalog ourselves — there is no Square id on catalog rows. The
//    one-time import (scripts/seed.ts) wipes and reloads, so it needs no natural
//    key. (payments.square_payment_id stays: Square still processes payments.)
//  - Order rows SNAPSHOT names/prices/tax at purchase time, so editing an item or
//    the tax rate later never rewrites a past receipt.

import { sql, relations } from "drizzle-orm";
import type { WeekHours } from "@/lib/status";
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

// ---- Catalog ----

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
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
