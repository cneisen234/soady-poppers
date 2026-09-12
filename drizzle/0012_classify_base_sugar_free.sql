-- Classify the seeded bases as sugar-free where the drink itself has no sugar
-- (zero sodas, sparkling waters, Alani energy, sugar-free Red Bull). The sugary
-- bases keep the defaults (regular = true, sugar-free = false). One-time.
UPDATE "custom_bases"
SET "available_regular" = false, "available_sugar_free" = true
WHERE "name" IN (
  'Coke Zero',
  'Dr. Pepper Zero',
  'Mt. Dew Zero',
  'A&W Root Beer Zero',
  'Lemon-Lime Soda Zero',
  'Orange Soda Zero',
  'Blue Raspberry Sparkling Water',
  'Strawberry Sparkling Water',
  'Fresca',
  'Cherry Lime Sparkling Water',
  'Pink Slush Alani',
  'Breezeberry Alani',
  'Cherry Twist Alani',
  'Dream Float Alani',
  'Iced Vanilla Berry Red Bull Sugar Free',
  'White Peach Red Bull Sugar Free'
);
