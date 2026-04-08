import axios from "axios";
import axiosInstance from "../axios/index";

const BASE = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rate-store`;

// ── List rate sources ───────────────────────────────────────────────

export function listRateSources(params: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  visibility?: string;
}) {
  const { page = 1, limit = 20, type, status, visibility } = params;
  let url = `${BASE}?page=${page}&limit=${limit}`;
  if (type) url += `&type=${type}`;
  if (status) url += `&status=${status}`;
  if (visibility) url += `&visibility=${visibility}`;
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

// ── Direct-to-S3 upload via presigned URL ──────────────────────────
// 1) Ask backend for a presigned PUT URL
// 2) PUT the file straight to S3 from the browser (no Node round-trip)
// Returns the public S3 URL of the uploaded object.

export async function uploadFileToS3(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const presignRes: any = await axiosInstance.post(`${BASE}/presigned-upload`, {
    filename: file.name,
    content_type: file.type || "application/octet-stream",
  });

  const { presigned_url, file_url } = presignRes?.data || {};
  if (!presigned_url || !file_url) {
    throw new Error("Failed to get presigned upload URL");
  }

  await axios.put(presigned_url, file, {
    headers: { "Content-Type": file.type || "application/octet-stream" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return file_url;
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

// ── Update visibility (admin — no owner check) ──────────────────────

export function updateRateSourceVisibility(
  id: number,
  visibility: "private" | "team" | "org"
) {
  return axiosInstance.put(`${BASE}/${id}/visibility`, { visibility });
}
