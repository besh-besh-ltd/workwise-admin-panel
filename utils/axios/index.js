import axios from "axios";
import { getAuthCookie, removeAuthCookie } from "@/utils/cookies";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    appVersion: "1.0"
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthCookie();
    if (token != null) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.response?.status === 401) {
      removeAuthCookie();
      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
