import axios from "axios";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
    appVersion: "1.0"
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
    // Do not auto-clear token on 401; let calling pages decide.
    // This avoids unintended logouts when a single protected endpoint returns 401.
    return Promise.reject(error);
  }
);

export default axiosInstance;
