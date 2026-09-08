// Helpers for reading fields off a server-action FormData.

/** Trimmed string value for a form field ("" when the field is absent). */
export function field(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/** True when a checkbox / switch field is present (i.e. checked). */
export function bool(form: FormData, key: string): boolean {
  return form.get(key) != null;
}
