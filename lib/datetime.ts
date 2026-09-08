// Date/time display helpers.

/**
 * Format an order timestamp for admin display, e.g. "Sep 5, 3:30 PM".
 * Pass { weekday: true } to prefix the weekday ("Fri, Sep 5, 3:30 PM").
 * Accepts a Date or an ISO string.
 */
export function formatOrderTime(
  value: Date | string,
  opts: { weekday?: boolean } = {},
): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  if (opts.weekday) options.weekday = "short";
  return new Date(value).toLocaleString("en-US", options);
}
