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

    error.userMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Something went wrong. Please try again.";

    if (status === 401 || status === 403) {
      console.warn("Auth error:", error.userMessage);

      window.location.href = `/unauthorized?message=${encodeURIComponent(
        error.userMessage
      )}`;
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
