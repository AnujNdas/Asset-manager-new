import axios from "axios";
import { progressController } from "../Components/ProgressController";

const API_URL = process.env.REACT_APP_API_URL;
console.log("ACTIVE API URL =", process.env.REACT_APP_API_URL);

if (!API_URL) {
  throw new Error("API base URL is missing. Check .env.local");
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    progressController.start();

    await new Promise((res) => setTimeout(res, 50));

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    progressController.stop();
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    progressController.stop();
    return response;
  },
  (error) => {
    progressController.stop();

    const status = error.response?.status;

    // Auth handling (keep as-is)
    if (status === 401 || status === 403) {
      localStorage.clear();
      window.location.href = "/user/login";
      return Promise.reject(error);
    }

    // 🔹 Normalize backend error message
    error.userMessage =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";

    return Promise.reject(error);
  }
);


export default axiosInstance;
