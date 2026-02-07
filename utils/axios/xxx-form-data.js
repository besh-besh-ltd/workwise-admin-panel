import axios from "axios";
import config from "./config";
import { getAuthCookie, removeAuthCookie } from "@/utils/cookies";

const axiosxdata = axios.create({
  baseURL: config.api,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    appVersion: "1.0",
  },
});

axiosxdata.interceptors.request.use(
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

axiosxdata.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    if (error.response?.status === 401 || error.response?.data?.status === 401) {
      removeAuthCookie();
      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosxdata;
