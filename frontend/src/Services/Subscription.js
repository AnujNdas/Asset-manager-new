import axiosInstance from "./axiosInstance";

/* ===========================
   GET TIERS (Public)
=========================== */
export const getTiers = async () => {
  const res = await axiosInstance.get("/subscription/tiers");
  return res.data;
};

/* ===========================
   PREVIEW PRICE (Auth)
=========================== */
export const previewPrice = async (data) => {
  const res = await axiosInstance.post(
    "/subscription/preview-price",
    data
  );
  return res.data;
};

/* ===========================
   CREATE CHECKOUT (Auth)
=========================== */
export const createCheckout = async (data) => {
  const res = await axiosInstance.post(
    "/subscription/create-checkout",
    data
  );
  return res.data;
};

/* ===========================
   VERIFY PAYMENT (Auth)
=========================== */
export const verifyPayment = async (data) => {
  const res = await axiosInstance.post(
    "/subscription/verify-payment",
    data
  );
  return res.data;
};

/* ===========================
   GET CURRENT SUBSCRIPTION
=========================== */
export const getMySubscription = async () => {
  const res = await axiosInstance.get("/subscription/me");
  return res.data;
};

export const cancelAutoPay = async () => {
  const res = await axiosInstance.post("/subscription/cancel-auto-pay");
  return res.data;
};