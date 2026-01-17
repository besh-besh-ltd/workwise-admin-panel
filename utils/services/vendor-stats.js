import axiosInstance from "@/utils/axios";

export const fetchVendorStatsOverview = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    // Allow "0" for is_private and subscription_plan filters
    if (value !== undefined && value !== null && value !== "") {
      // Handle arrays (like vendor_ids) - send as multiple query params
      if (Array.isArray(value) && value.length > 0) {
        // For vendor_ids, send each ID as a separate query param
        value.forEach((item) => {
          query.append(key, item);
        });
      } else if (!Array.isArray(value)) {
        query.append(key, value);
      }
    } else if ((key === 'is_private' || key === 'subscription_plan') && (value === '0' || value === 0)) {
      // Explicitly allow "0" for these filters
      query.append(key, value);
    }
  });

  return axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/stats/overview${query.toString() ? `?${query.toString()}` : ""}`
  );
};

export const fetchVendorStatsByVendor = (vendorId, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  return axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/stats/${vendorId}${query.toString() ? `?${query.toString()}` : ""}`
  );
};

export const fetchQuotationFinancialAnalysis = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Handle arrays (like vendor_ids) - send as multiple query params
      if (Array.isArray(value) && value.length > 0) {
        // For vendor_ids, send each ID as a separate query param
        value.forEach((item) => {
          query.append(key, item);
        });
      } else if (!Array.isArray(value)) {
        query.append(key, value);
      }
    }
  });

  return axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/stats/quotation/financial${query.toString() ? `?${query.toString()}` : ""}`
  );
};

