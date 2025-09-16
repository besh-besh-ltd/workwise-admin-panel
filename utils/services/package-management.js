import axiosInstance from "@/utils/axios";

const BASE = `${process.env.NEXT_PUBLIC_API_WEB_URL}/packages`;

export const listPackages = (params = {}) => {
  const { q, created_by, page = 1, limit = 10, sort = "DESC" } = params;
  const query = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(created_by ? { created_by } : {}),
    page: String(page),
    limit: String(limit),
    sort
  }).toString();
  return axiosInstance.get(`${BASE}?${query}`);
};

export const getPackageById = (id) => {
  return axiosInstance.get(`${BASE}/${id}`);
};

export const createPackage = (payload) => {
  return axiosInstance.post(`${BASE}/`, payload);
};

export const updatePackage = (id, payload) => {
  return axiosInstance.put(`${BASE}/${id}`, payload);
};

export const deletePackage = (id) => {
  return axiosInstance.delete(`${BASE}/${id}`);
};

export const addPackageItem = (packageId, item) => {
  return axiosInstance.post(`${BASE}/${packageId}/items`, item);
};

export const removePackageItem = (itemId) => {
  return axiosInstance.delete(`${BASE}/items/${itemId}`);
};

export const addPackageVendor = (packageId, vendorId) => {
  return axiosInstance.post(`${BASE}/${packageId}/vendors`, { vendor_id: vendorId });
};

export const removePackageVendor = (linkId) => {
  return axiosInstance.delete(`${BASE}/vendors/${linkId}`);
};







