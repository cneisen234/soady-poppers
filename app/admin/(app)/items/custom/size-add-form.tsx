"use client";

import { useRef } from "react";
import { createSize } from "./size-actions";

export default function SizeAddForm() {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await createSize(fd);
        formRef.current?.reset();
      }}
      className="admin-discount-add"
    >
      <input
        name="name"
        className="admin-input"
        placeholder="Size (e.g. 16 oz)"
        aria-label="Size name"
        autoComplete="off"
        required
      />
      <div className="admin-discount-add-row">
        <input
          name="price"
          className="admin-input w-24"
          type="text"
          inputMode="decimal"
          placeholder="$ price"
          aria-label="Size price"
          required
        />
        <button type="submit" className="admin-btn">
          + Add size
        </button>
      </div>
    </form>
  );
}
