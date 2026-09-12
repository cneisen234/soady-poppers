import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { customBases, customSyrups, customMilks, customToppings } from "@/lib/db/schema";
import { getCustomSizes } from "@/lib/custom-drink";
import CustomDrinkManager from "./custom-drink-manager";
import SizeRow from "./size-row";
import SizeAddForm from "./size-add-form";

// The custom-drink option pools, shown inside Settings → Custom Drink. Sub-tabs
// (Bases / Syrups / Milks) with an Add-modal are handled by the client manager.
export default async function CustomDrinkPanel() {
  const [bases, syrups, milks, toppings, sizes] = await Promise.all([
    db.select().from(customBases).orderBy(asc(customBases.name)),
    db.select().from(customSyrups).orderBy(asc(customSyrups.name)),
    db.select().from(customMilks).orderBy(asc(customMilks.name)),
    db.select().from(customToppings).orderBy(asc(customToppings.name)),
    getCustomSizes(),
  ]);

  return (
    <>
    <fieldset className="admin-fieldset">
      <legend>Sizes</legend>
      {sizes.map((s) => (
        <SizeRow key={s.id} id={s.id} name={s.name} price={(s.priceCents / 100).toFixed(2)} />
      ))}
      {sizes.length === 0 && <p className="admin-stub">No sizes yet.</p>}
      <SizeAddForm />
    </fieldset>

    <fieldset className="admin-fieldset">
      <legend>Options</legend>
      <CustomDrinkManager
        bases={bases.map((b) => ({
          id: b.id,
          name: b.name,
          availableRegular: b.availableRegular,
          availableSugarFree: b.availableSugarFree,
          active: b.active,
        }))}
        syrups={syrups.map((s) => ({
          id: s.id,
          name: s.name,
          availableRegular: s.availableRegular,
          availableSugarFree: s.availableSugarFree,
          active: s.active,
        }))}
        milks={milks.map((m) => ({ id: m.id, name: m.name, active: m.active }))}
        toppings={toppings.map((t) => ({ id: t.id, name: t.name, active: t.active }))}
      />
    </fieldset>
    </>
  );
}
