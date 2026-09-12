// Guard for dynamic `[id]` routes: Postgres rejects a non-UUID string passed to a
// uuid column with a 500 ("invalid input syntax for type uuid"). Callers use this
// to turn a malformed id into a clean notFound() before touching the DB.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
