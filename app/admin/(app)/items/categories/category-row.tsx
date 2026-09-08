"use client";

import { useRef, useState } from "react";
import { renameCategory, deleteCategory } from "../actions";
import ConfirmDelete from "../../confirm-delete";
import { TrashIcon } from "../../icons";
import { useAutosave, SaveStatus } from "../../autosave";

export default function CategoryRow({
  id,
  name,
  itemCount,
}: {
  id: string;
  name: string;
  itemCount: number;
}) {
  const [value, setValue] = useState(name);
  const latest = useRef(value);
  latest.current = value;
  const { status, schedule } = useAutosave();

  function onChange(next: string) {
    setValue(next);
    schedule(async () => {
      const name = latest.current.trim();
      if (!name) return; // renameCategory ignores blanks; don't wipe the name
      const fd = new FormData();
      fd.set("id", id);
      fd.set("name", name);
      await renameCategory(fd);
    });
  }

  return (
    <div className="admin-list-row">
      <div className="admin-list-main">
        <input
          className="admin-input"
          aria-label="Category name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <span className="admin-list-count">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
      <SaveStatus status={status} />
      <ConfirmDelete
        action={deleteCategory}
        fields={{ id }}
        title={`Delete “${name}”?`}
        message="Items in this category become uncategorized — they are not deleted."
        triggerLabel={<TrashIcon />}
        triggerAriaLabel="Delete category"
      />
    </div>
  );
}
