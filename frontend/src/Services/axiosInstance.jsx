import axios from "axios";
import { progressController } from "../Components/ProgressController";  
// This is a central controller to connect Axios ↔ ProgressBar

const API_URL = "https://asset-manager-new.onrender.com/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Start global progress bar
    progressController.start();

    await new Promise((res) => setTimeout(res, 50));
    const token = sessionStorage.getItem("token");

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
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/user/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
