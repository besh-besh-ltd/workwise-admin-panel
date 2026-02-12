export type DateInput = string | number | Date;

interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
  fallback?: string;
}

/**
 * Formats a date into a readable string.
 *
 * @param date - string | number | Date
 * @param options - Intl formatting options + locale & fallback
 * @returns formatted date string
 */
export function formatDate(
  date: DateInput,
  options?: FormatDateOptions,
): string {
  const { locale = "en-IN", fallback = "--", ...intlOptions } = options || {};

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return fallback;
  }

  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...intlOptions,
  });
}

/**
 * Formats a date into a readable date and time string.
 *
 * @param date - The input date (string | number | Date)
 * @param options - Additional Intl formatting options including locale and fallback
 * @returns The formatted date and time string
 */
export function formatDateTime(
  date: DateInput,
  options?: FormatDateOptions,
): string {
  return formatDate(date, {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  } as FormatDateOptions);
}

/**
 * Formats a date into a relative string such as "Today", "Yesterday", or "X days ago".
 * Falls back to a formatted date string if the date is more than 6 days ago.
 *
 * @param date - The input date (string | number | Date)
 * @returns The relative date string
 */
export function formatRelativeDate(date: DateInput): string {
  const d: Date = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const diff: number = Date.now() - d.getTime();
  const days: number = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return formatDate(d);
}
