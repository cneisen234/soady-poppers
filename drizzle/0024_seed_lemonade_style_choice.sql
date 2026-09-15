-- Classic Lemonade offers Regular / Sugar-free via a pill on its card.
UPDATE "products" SET "style_choice" = true WHERE "name" = 'Classic Lemonade' AND "category_id" = (SELECT "id" FROM "categories" WHERE "name" = 'Classic Lemonade' LIMIT 1);
