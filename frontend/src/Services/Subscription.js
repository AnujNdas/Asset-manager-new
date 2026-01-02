import axiosInstance from "./axiosInstance";

export const previewPrice = async (data) => {
  const response = await axiosInstance.post(
    "/subscription/preview-price",
    data
  );
  return response.data;
};
// 🔹 Fetch all pricing tiers
export const getTiers = async () => {
  const res = await axiosInstance.get("/subscription/tiers");
  return res.data;
};
