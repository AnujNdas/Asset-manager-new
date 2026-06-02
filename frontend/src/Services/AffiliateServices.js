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

  console.log(
    "📡 Sending affiliate track request:",
    ref
  );

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

  console.log(
    "📥 Affiliate track response:",
    res.data
  );

  return res.data;
};
export const getAffiliateEarnings = async () => {

  const response = await axiosInstance.get(
    "/affiliate/earnings",
  );

  return response.data;
};
// ======================================
// AFFILIATE SETTINGS - PROFILE
// ======================================

export const getAffiliateProfileSettings =
  async () => {
    const res = await axiosInstance.get(
      "/affiliate/settings/profile"
    );

    return res.data;
  };

export const updateAffiliateProfileSettings =
  async (data) => {
    const res = await axiosInstance.put(
      "/affiliate/settings/profile",
      data
    );

    return res.data;
  };

// ======================================
// AFFILIATE SETTINGS - PAYOUT
// ======================================

export const getAffiliatePayoutSettings =
  async () => {
    const res = await axiosInstance.get(
      "/affiliate/settings/payout"
    );

    return res.data;
  };

export const updateAffiliatePayoutSettings =
  async (data) => {
    const res = await axiosInstance.put(
      "/affiliate/settings/payout",
      data
    );

    return res.data;
  };

// ======================================
// AFFILIATE SETTINGS - PREFERENCES
// ======================================

export const getAffiliatePreferences =
  async () => {
    const res = await axiosInstance.get(
      "/affiliate/settings/preferences"
    );

    return res.data;
  };

export const updateAffiliatePreferences =
  async (data) => {
    const res = await axiosInstance.put(
      "/affiliate/settings/preferences",
      data
    );

    return res.data;
  };
  export const getAffiliateTickets =
  async () => {
    const res =
      await axiosInstance.get(
        "/affiliate/tickets"
      );

    return res.data;
  };

export const createAffiliateTicket =
  async (data) => {
    const res =
      await axiosInstance.post(
        "/affiliate/tickets",
        data
      );

    return res.data;
  };