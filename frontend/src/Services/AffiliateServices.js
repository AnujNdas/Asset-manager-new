// src/Services/AffiliateService.js

import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/`;
// ✅ Dashboard stats
export const getAffiliateDashboard = async () => {
  const res = await axios.get(
    `${API_URL}/affiliate/dashboard`
  );

  return res.data;
};

// ✅ Referral list
export const getAffiliateReferrals = async () => {
  const res = await axios.get(
    `${API_URL}/affiliate/referrals`
  );

  return res.data;
};

// ✅ Copy / regenerate referral link
export const regenerateAffiliateLink = async () => {
  const res = await axiosInstance.patch(
    `${API_URL}/affiliate/referral-link`
  );

  return res.data;
};

// ✅ Payout settings
export const updateAffiliatePayout = async (
  data
) => {
  const res = await axiosInstance.put(
    `${API_URL}/affiliate/payout`,
    data
  );

  return res.data;
};