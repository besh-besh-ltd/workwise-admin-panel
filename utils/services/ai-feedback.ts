import aiServer from "@/utils/axios/ai-server";

const BASE = "/api/admin/v1";

export function getFeedbackOverview(module?: string) {
  const params = module ? `?module=${module}` : "";
  return aiServer.get(`${BASE}/feedback/overview${params}`);
}

export function getTopCorrectedFields(module = "tender_summary", limit = 20) {
  return aiServer.get(`${BASE}/feedback/fields?module=${module}&limit=${limit}`);
}

export function getFeedbackByTender(module = "tender_summary", limit = 50) {
  return aiServer.get(`${BASE}/feedback/tenders?module=${module}&limit=${limit}`);
}

export function getAccuracyOverview(module = "tender_summary", period?: string) {
  const params = new URLSearchParams({ module });
  if (period) params.append("period", period);
  return aiServer.get(`${BASE}/accuracy/overview?${params}`);
}

export function getTenderDetail(tenderId: string) {
  return aiServer.get(`${BASE}/tenders/${tenderId}/detail`);
}

export function getVendorEvalDetail(runId: string) {
  return aiServer.get(`${BASE}/tenders/vendor-eval/${runId}/detail`);
}

export function getProcessedTenders(
  module = "tender_summary",
  period?: string,
  page = 1,
  limit = 20
) {
  const params = new URLSearchParams({ module, page: String(page), limit: String(limit) });
  if (period) params.append("period", period);
  return aiServer.get(`${BASE}/accuracy/tenders?${params}`);
}
