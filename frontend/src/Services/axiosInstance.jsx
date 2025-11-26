// src/Services/axiosInstance.js
import axios from "axios";

const API_URL = "https://asset-manager-new.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Automatically attach token if it exists
axiosInstance.interceptors.request.use(
  async (config) => {
    await new Promise(res => setTimeout(res, 50)); // small delay fixes many issues
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);


export default axiosInstance;
