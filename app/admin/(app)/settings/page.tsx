import { getSettings } from "@/lib/settings";
import SettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();

  return (
    <>
      <h1 className="admin-h1">Settings</h1>
      <p className="admin-sub">Tax, delivery fees, hours, and the online-ordering switch.</p>

      <SettingsForm
        settings={{
          acceptingOrders: s.acceptingOrders,
          pausedMessage: s.pausedMessage,
          taxRateBps: s.taxRateBps,
          deliveryPerItemCents: s.deliveryPerItemCents,
          deliveryFlatCents: s.deliveryFlatCents,
          deliveryFlatMinItems: s.deliveryFlatMinItems,
          deliveryFreeMinItems: s.deliveryFreeMinItems,
          hours: s.hours,
        }}
      />
    </>
  );
}
