// src/Services/axiosInstance.js
import axios from "axios";

const API_URL = "https://asset-manager-new.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token with a small delay (fixes first-load sessionStorage bug)
axiosInstance.interceptors.request.use(
  async (config) => {
    await new Promise((res) => setTimeout(res, 50));
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔥 Handle both EXPIRED + INVALID token cases
    if (status === 401 || status === 403) {
      console.log("🔒 Unauthorized or Forbidden → logging out");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      window.location.href = "/user/login"; // <-- your login route
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
