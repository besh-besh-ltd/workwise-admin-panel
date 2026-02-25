/**
 * Utility functions for vendor stats
 */

interface Vendor {
  awards?: number;
  regrets?: number;
  avg_response_minutes?: number | null;
}

interface VendorRow {
  vendor_id?: string | number;
  id?: string | number;
}

/**
 * Check if vendor has actually submitted quotes (has response time data)
 */
export const hasResponseData = (vendor: Vendor | null | undefined): boolean => {
  if (!vendor) return false;
  // If vendor has awards or regrets, they've submitted quotes
  const hasQuotes = (vendor?.awards || 0) > 0 || (vendor?.regrets || 0) > 0;
  // If they have response time data (not null and >= 0), they've submitted quotes
  const hasResponseTime = vendor?.avg_response_minutes != null && vendor.avg_response_minutes >= 0;
  return hasQuotes || hasResponseTime;
};

/**
 * Format response time in minutes to human-readable string
 */
export const formatResponseTime = (
  minutes: number | null | undefined,
  vendor: Vendor | null = null
): string => {
  // If vendor is provided, check if they have actual quote data
  if (vendor && !hasResponseData(vendor)) {
    return "N/A";
  }

  // Handle null, undefined, or 0 minutes
  if (minutes == null || minutes === 0) {
    // If vendor has awards/regrets, 0 is valid (instant response) - show "0 min"
    // Otherwise, it's likely no data
    if (vendor && ((vendor.awards || 0) > 0 || (vendor.regrets || 0) > 0)) {
      return "0 min";
    }
    return "N/A";
  }

  // Format positive minutes
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  const hrs = hours % 24;
  return `${days}d ${hrs}h`;
};

/**
 * Format delivery period in days
 */
export const formatDeliveryPeriod = (period: number | null | undefined): string => {
  if (!period || period === 0) return "N/A";
  return `${period} days`;
};

/**
 * Get vendor ID from row object, ensuring it's always a string
 */
export const getVendorId = (row: VendorRow | null | undefined): string => {
  if (!row) return "";
  // Always use vendor_id if available, fallback to id
  const id = row.vendor_id ?? row.id;
  return String(id || "");
};
