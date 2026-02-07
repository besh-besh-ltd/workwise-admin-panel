/**
 * Utility functions for vendor stats
 */

/**
 * Check if vendor has actually submitted quotes (has response time data)
 * @param {Object} vendor - Vendor object
 * @returns {boolean} - True if vendor has submitted quotes
 */
export const hasResponseData = (vendor) => {
  if (!vendor) return false;
  // If vendor has awards or regrets, they've submitted quotes
  const hasQuotes = (vendor?.awards || 0) > 0 || (vendor?.regrets || 0) > 0;
  // If they have response time data (not null and >= 0), they've submitted quotes
  const hasResponseTime = vendor?.avg_response_minutes != null && vendor.avg_response_minutes >= 0;
  return hasQuotes || hasResponseTime;
};

/**
 * Format response time in minutes to human-readable string
 * @param {number} minutes - Response time in minutes
 * @param {Object} vendor - Vendor object (optional)
 * @returns {string} - Formatted response time
 */
export const formatResponseTime = (minutes, vendor = null) => {
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

export const formatDate = (date, locale = "en-GB") => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format delivery period in days
 * @param {number} period - Delivery period in days
 * @returns {string} - Formatted delivery period
 */
export const formatDeliveryPeriod = (period) => {
  if (!period || period === 0) return "N/A";
  return `${period} days`;
};

/**
 * Get vendor ID from row object, ensuring it's always a string
 * @param {Object} row - Row object with vendor_id or id
 * @returns {string} - Vendor ID as string
 */
export const getVendorId = (row) => {
  if (!row) return "";
  // Always use vendor_id if available, fallback to id
  const id = row.vendor_id ?? row.id;
  return String(id || "");
};

