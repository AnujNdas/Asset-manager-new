// src/Services/AffiliateService.js

import axiosInstance from "./axiosInstance";

// ✅ Dashboard stats
export const getAffiliateDashboard = async () => {
  const res = await axiosInstance.get(
    "/affiliate/dashboard"
  );

  return res.data;
};

// ✅ Referral list
export const getAffiliateReferrals = async () => {
  const res = await axiosInstance.get(
    "/affiliate/referrals"
  );

  return res.data;
};

// ✅ Copy / regenerate referral link
export const regenerateAffiliateLink = async () => {
  const res = await axiosInstance.patch(
    "/affiliate/referral-link"
  );

  return res.data;
};

// ✅ Payout settings
export const updateAffiliatePayout = async (
  data
) => {
  const res = await axiosInstance.put(
    "/affiliate/payout",
    data
  );

  return res.data;
};
// ✅ Track affiliate visit
export const trackAffiliateVisit = async (
  ref
) => {

  const res =
    await axiosInstance.post(
      "/affiliate/track",
      {
        ref,
      },
      {
        withCredentials: true,
      }
    );

  return res.data;
};