import axios from "axios";
import { progressController } from "../Components/ProgressController";

const API_URL = "https://asset-manager-new.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
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
    if (status === 401 || status === 403) {
      localStorage.clear();
      window.location.href = "/user/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
