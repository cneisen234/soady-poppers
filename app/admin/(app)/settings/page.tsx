import { getSettings } from "@/lib/settings";
import { updateSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettings();

  const timeStr = (dec: number) => {
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  const dayList: [number, string][] = [
    [1, "Monday"],
    [2, "Tuesday"],
    [3, "Wednesday"],
    [4, "Thursday"],
    [5, "Friday"],
    [6, "Saturday"],
    [0, "Sunday"],
  ];

  return (
    <>
      <h1 className="admin-h1">Settings</h1>
      <p className="admin-sub">Tax, delivery fees, and the online-ordering switch.</p>

      <form action={updateSettings} className="admin-card admin-form">
        <fieldset className="admin-fieldset">
          <legend>Online ordering</legend>
          <label className="admin-check">
            <input type="checkbox" name="acceptingOrders" defaultChecked={s.acceptingOrders} />
            <span>Accepting online orders</span>
          </label>
          <label className="admin-field" style={{ marginTop: 12 }}>
            <span>Paused message — shown to customers when ordering is off</span>
            <input
              name="pausedMessage"
              defaultValue={s.pausedMessage ?? ""}
              className="admin-input"
              placeholder="Online ordering is temporarily paused — check back soon!"
            />
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>Tax</legend>
          <label className="admin-field">
            <span>Global tax rate (%) — applied to non-exempt items</span>
            <input
              name="taxRatePercent"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(s.taxRateBps / 100).toString()}
              className="admin-input"
              style={{ maxWidth: 160 }}
            />
          </label>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>Delivery fee</legend>
          <div className="admin-grid2">
            <label className="admin-field">
              <span>Per item ($)</span>
              <input
                name="perItem"
                type="number"
                step="0.01"
                min="0"
                defaultValue={(s.deliveryPerItemCents / 100).toFixed(2)}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Flat fee ($)</span>
              <input
                name="flat"
                type="number"
                step="0.01"
                min="0"
                defaultValue={(s.deliveryFlatCents / 100).toFixed(2)}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Flat fee starts at (items)</span>
              <input
                name="flatMin"
                type="number"
                step="1"
                min="0"
                defaultValue={s.deliveryFlatMinItems}
                className="admin-input"
              />
            </label>
            <label className="admin-field">
              <span>Free delivery at (items)</span>
              <input
                name="freeMin"
                type="number"
                step="1"
                min="0"
                defaultValue={s.deliveryFreeMinItems}
                className="admin-input"
              />
            </label>
          </div>
          <p className="admin-sub" style={{ margin: "12px 0 0" }}>
            Under {s.deliveryFlatMinItems} items: per-item fee. {s.deliveryFlatMinItems}–
            {s.deliveryFreeMinItems - 1} items: flat fee. {s.deliveryFreeMinItems}+ items: free.
          </p>
        </fieldset>

        <fieldset className="admin-fieldset">
          <legend>Hours</legend>
          <div className="admin-hours">
            {dayList.map(([d, label]) => {
              const h = s.hours[d];
              return (
                <div key={d} className="admin-hours-row">
                  <div className="admin-hours-head">
                    <span className="admin-hours-day">{label}</span>
                    <label className="admin-check inline">
                      <input type="checkbox" name={`openDay_${d}`} defaultChecked={!!h} />
                      <span>Open</span>
                    </label>
                  </div>
                  <div className="admin-hours-times">
                    <input
                      type="time"
                      name={`open_${d}`}
                      defaultValue={timeStr(h?.open ?? 9)}
                      className="admin-input sm"
                      aria-label={`${label} open`}
                    />
                    <span className="admin-hours-dash">–</span>
                    <input
                      type="time"
                      name={`close_${d}`}
                      defaultValue={timeStr(h?.close ?? 17)}
                      className="admin-input sm"
                      aria-label={`${label} close`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className="admin-actions">
          <button type="submit" className="admin-btn">
            Save settings
          </button>
        </div>
      </form>
    </>
  );
}
