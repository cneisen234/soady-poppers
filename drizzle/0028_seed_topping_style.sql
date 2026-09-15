-- Coconut cold foam is regular only (it changes the energy base). Everything
-- else stays available for both styles.
UPDATE "custom_toppings" SET "available_sugar_free" = false WHERE "name" = 'Coconut Cream';
