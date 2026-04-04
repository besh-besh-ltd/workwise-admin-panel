import axiosInstance from "../axios/index";
import axiosFormData from "../axios/form-data";

const BASE = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rate-store`;

// ── List rate sources ───────────────────────────────────────────────

export function listRateSources(params: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}) {
  const { page = 1, limit = 20, type, status } = params;
  let url = `${BASE}?page=${page}&limit=${limit}`;
  if (type) url += `&type=${type}`;
  if (status) url += `&status=${status}`;
  return axiosInstance.get(url);
}

// ── Get single rate source ──────────────────────────────────────────

export function getRateSource(id: number) {
  return axiosInstance.get(`${BASE}/${id}`);
}

// ── Get items of a rate source ──────────────────────────────────────

export function getRateSourceItems(id: number, page = 1, limit = 50) {
  return axiosInstance.get(`${BASE}/${id}/items?page=${page}&limit=${limit}`);
}

// ── Upload rate chart (S3 URL + triggers parsing) ───────────────────

export function uploadRateChart(data: {
  name: string;
  type: "govt_chart" | "custom_upload";
  sub_type?: string;
  version?: string;
  effective_date?: string;
  source_file_url: string;
}) {
  return axiosInstance.post(`${BASE}/upload`, data);
}

// ── Upload file to S3 (get URL) ────────────────────────────────────

export function uploadFileToS3(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return axiosFormData.post(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/media/upload-file`,
    formData
  );
}

// ── Archive a rate source ───────────────────────────────────────────

export function archiveRateSource(id: number) {
  return axiosInstance.put(`${BASE}/${id}/archive`);
}

// ── Delete a rate source ────────────────────────────────────────────

export function deleteRateSource(id: number) {
  return axiosInstance.delete(`${BASE}/${id}`);
}

// ── Trigger embedding generation ────────────────────────────────────

export function embedRateSource(id: number) {
  return axiosInstance.post(`${BASE}/${id}/embed`);
}
