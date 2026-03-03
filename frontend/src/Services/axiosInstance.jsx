import axios from "axios";
import { progressController } from "../Components/ProgressController";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
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

    const auth = JSON.parse(localStorage.getItem("auth"));

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
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
    const currentPath = window.location.pathname;

    error.userMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Something went wrong. Please try again.";

    // ✅ 401 → Session expired → Login
    if (status === 401) {
      console.warn("Session expired or invalid token");

      localStorage.removeItem("auth");

      if (currentPath !== "/user/login") {
        window.location.href = "/user/login";
      }

      return Promise.reject(error);
    }

    // ✅ 403 → Authenticated but forbidden → Unauthorized
    if (status === 403 && currentPath !== "/unauthorized") {
      window.location.href = `/unauthorized?message=${encodeURIComponent(
        error.userMessage
      )}`;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
