import { AxiosPromise } from "axios";
import axiosInstance from "@/utils/axios";

type ParamValue = string | number | boolean | string[] | number[] | null | undefined;

interface QueryParams {
  [key: string]: ParamValue;
}

export const fetchVendorStatsOverview = (params: QueryParams = {}): AxiosPromise => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    // Values like "0" and 0 are valid and pass the check below
    if (value !== undefined && value !== null && value !== "") {
      // Handle arrays (like vendor_ids) - send as multiple query params
      if (Array.isArray(value) && value.length > 0) {
        // For vendor_ids, send each ID as a separate query param
        (value as (string | number)[]).forEach((item) => {
          query.append(key, String(item));
        });
      } else if (!Array.isArray(value)) {
        query.append(key, String(value));
      }
    }
  });

  return axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/stats/overview${query.toString() ? `?${query.toString()}` : ""}`
  );
};

export const fetchVendorStatsByVendor = (
  vendorId: string | number,
  params: QueryParams = {}
): AxiosPromise => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/stats/${vendorId}${query.toString() ? `?${query.toString()}` : ""}`
  );
};

export const fetchQuotationFinancialAnalysis = (params: QueryParams = {}): AxiosPromise => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Handle arrays (like vendor_ids) - send as multiple query params
      if (Array.isArray(value) && value.length > 0) {
        // For vendor_ids, send each ID as a separate query param
        (value as (string | number)[]).forEach((item) => {
          query.append(key, String(item));
        });
      } else if (!Array.isArray(value)) {
        query.append(key, String(value));
      }
    }
  });

  return axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/stats/quotation/financial${query.toString() ? `?${query.toString()}` : ""}`
  );
};
