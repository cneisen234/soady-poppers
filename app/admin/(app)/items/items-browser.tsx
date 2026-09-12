"use client";

import { useState, type ReactNode } from "react";

// Tab switcher on the Items page: the item list vs. the custom-drink config.
export default function ItemsBrowser({
  itemsTab,
  customTab,
}: {
  itemsTab: ReactNode;
  customTab: ReactNode;
}) {
  const [tab, setTab] = useState<"items" | "custom">("items");
  return (
    <>
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === "items" ? "active" : ""}`}
          onClick={() => setTab("items")}
        >
          Items
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "custom" ? "active" : ""}`}
          onClick={() => setTab("custom")}
        >
          Custom Drink
        </button>
      </div>
      {tab === "items" ? itemsTab : customTab}
    </>
  );
}
