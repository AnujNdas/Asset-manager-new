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
    const data = error.response?.data || {};
    const currentPath = window.location.pathname;

    // ✅ Normalize error object
    const normalizedError = {
      status,
      message:
        data.message ||
        data.error ||
        "Something went wrong. Please try again.",
      code: data.code || null,
      details: data.details || null,
      raw: error
    };

    // attach to error
    error.normalized = normalizedError;

    /* =========================
       AUTH HANDLING
    ========================== */
const publicRoutes = [
  "/user/login",
  "/user/signup",
  "/user/forgot",
];

const isResetRoute = currentPath.startsWith("/user/reset/");

if (status === 401) {
  console.warn("Session expired");

  localStorage.removeItem("auth");

  // ✅ Do NOT redirect on public auth pages
  if (
    !publicRoutes.includes(currentPath) &&
    !isResetRoute
  ) {
    window.location.href = "/user/login";
  }

  return Promise.reject(error);
}
    if (status === 403) {
      if (currentPath !== "/unauthorized") {
        window.location.href = `/unauthorized?message=${encodeURIComponent(
          normalizedError.message
        )}`;
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
