import { getSettings } from "@/lib/settings";
import CustomPricingForm from "./custom-pricing-form";
import CustomDrinkPanel from "./custom-drink-panel";

// The full custom-drink configuration, shown under Items → Custom Drink:
// add-on pricing, sizes, and the base/syrup/milk option pools.
export default async function CustomDrinkTab() {
  const s = await getSettings();
  return (
    <div className="admin-card admin-form">
      <span className="admin-sub" style={{ margin: 0 }}>
        Changes save automatically.
      </span>
      <CustomPricingForm
        pricing={{
          addonSyrupCents: s.addonSyrupCents,
          customFreeSyrups: s.customFreeSyrups,
          customMaxSyrups: s.customMaxSyrups,
          addonCaffeineCents: s.addonCaffeineCents,
          addonElectrolyteCents: s.addonElectrolyteCents,
          addonMilkCents: s.addonMilkCents,
        }}
      />
      <CustomDrinkPanel />
    </div>
  );
}
