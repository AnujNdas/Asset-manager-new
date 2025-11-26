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

// AUTO LOGOUT if token expires or API returns 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("🔒 Token expired → logging out");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
