import axios, { InternalAxiosRequestConfig } from "axios";

/**
 * Axios instance for direct admin panel → AI server calls.
 * Uses the admin's Bearer token — the AI server auth middleware
 * forwards it to the Node backend's get-profile endpoint for verification.
 *
 * For service-token calls (cross-tenant admin data), the Node backend
 * should proxy via its own service token. But for V1, we use direct calls
 * with a configured service token from env.
 */
const aiServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TENDER_SERVER_URL || "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
});

aiServerInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Use service token for admin API calls
    const serviceToken = process.env.NEXT_PUBLIC_AI_SERVICE_TOKEN || "";
    if (serviceToken) {
      config.headers.Authorization = `Service ${serviceToken}`;
      // Acting user ID — use a placeholder admin ID for cross-tenant queries
      const adminId = localStorage.getItem("adminId") || "admin";
      config.headers["X-Acting-User-Id"] = adminId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

aiServerInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default aiServerInstance;
