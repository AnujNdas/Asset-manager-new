import axiosInstance from "./axiosInstance";
import axios from 'axios';
const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;
/* =====================================================
   SUPER ADMIN – DASHBOARD
===================================================== */

/**
 * GET /super-admin/dashboard/overview
 */
export const getSuperAdminOverview = async () => {
  const response = await axiosInstance.get(
    "/super-admin/dashboard/overview"
  );
  return response.data.data;
};

/* =====================================================
   SUPER ADMIN – ORGANIZATIONS
===================================================== */

/**
 * GET /super-admin/organizations
 */
export const getOrganizations = async () => {
  const response = await axiosInstance.get(
    "/super-admin/organizations"
  );
  return response.data.data;
};
export const getOrganizationUsers = async (orgId) => {
  const res = await axiosInstance.get(`/super-admin/organizations/${orgId}/users`);
  return res.data;
};

/**
 * POST /super-admin/organizations
*/
export const createOrganization = async (payload) => {
  const response = await axiosInstance.post(
    "/super-admin/organizations",
    payload
  );
  return response.data.data;
};

/**
 * GET /super-admin/organizations/:id
*/
export const getOrganizationById = async (orgId) => {
  const response = await axiosInstance.get(
    `/super-admin/organizations/${orgId}`
  );
  return response.data.data;
};

/**
 * PATCH /super-admin/organizations/:id/status
*/
export const toggleOrganizationStatus = async (orgId) => {
  const response = await axiosInstance.patch(
    `/super-admin/organizations/${orgId}/status`
  );
  return response.data.data;
};

/* =====================================================
SUPER ADMIN – SETTINGS
===================================================== */

/**
 * GET /super-admin/settings
*/
export const getSystemSettings = async () => {
  const response = await axiosInstance.get(
    "/super-admin/settings"
  );
  return response.data.data;
};

/**
 * PUT /super-admin/settings
*/
export const updateSystemSettings = async (payload) => {
  const response = await axiosInstance.put(
    "/super-admin/settings",
    payload
  );
  return response.data.data;
};

/* =====================================================
   SUPER ADMIN – GOOGLE ANALYTICS
===================================================== */

/**
 * GET /super-admin/analytics/ga
 * Site-wide analytics from GA4
 */
export const getGAAnalytics = async () => {
  const res = await axiosInstance.get(
    "/super-admin/analytics/ga"
  );
  return res.data.data;
};

export const getLoginActivity = async () => {
  const res = await axiosInstance.get(
    "/super-admin/login-activity",
  );
  return res.data;
};
export const getRouteHealth = async () => {
  const res = await axiosInstance.get(
    "/super-admin/",
  );
  return res.data;
};
export const getSubscription = async () => {
  const res = await axiosInstance.get(
    "/super-admin/subscriptions",
  );
  return res.data;
};
export const getAffiliateCommissionPayments = async () => {
  const res = await axiosInstance.get(
    "/super-admin/commission-payments",
  );
  return res.data;
};



export const getAffiliatePaymentTicketsForAdmin = async () => {
  const response = await axiosInstance.get(
    "/super-admin/payment-ticket",
  );

  return response;
};


// ==========================================
// GET SINGLE PAYMENT TICKET
// ==========================================

export const getAffiliatePaymentTicketById = async (
  ticketId
) => {
  const response = await axiosInstance.get(
    `/super-admin/payment-ticket/${ticketId}`,
  );

  return response;
};


// ==========================================
// PROCESS PAYMENT TICKET
// ==========================================

export const processAffiliatePaymentTicket = async (
  ticketId,
  data = {}
) => {
  const response = await axiosInstance.patch(
    `/super-admin/payment-ticket/${ticketId}/process`,
    data,
  );

  return response;
};


// ==========================================
// RESOLVE PAYMENT TICKET
// ==========================================

export const resolveAffiliatePaymentTicket = async (
  ticketId,
  data = {}
) => {
  const response = await axiosInstance.patch(
    `/super-admin/payment-ticket/${ticketId}/resolve`,
    data,
  );

  return response;
};


// ==========================================
// REJECT PAYMENT TICKET
// ==========================================

export const rejectAffiliatePaymentTicket = async (
  ticketId,
  data = {}
) => {
  const response = await axiosInstance.patch(
    `/super-admin/payment-ticket/${ticketId}/reject`,
    data,
  );

  return response;
};
export const approveAffiliateStatus = async (id, statusData) => {
  try {
    const response = await axiosInstance.patch(
      `/super-admin/settings/update/${id}/status`,
      statusData // Pass the body data (e.g., { status: 'approved' } or { status: 'rejected', rejectionReason: '...' })
    );

    return response // Usually you want to return just the data payload from Axios
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Services/AdminServices.js

export const getAffiliates = async (statusFilter = "") => {
  try {
    // If statusFilter is provided (e.g., 'pending'), it appends ?status=pending
    const query = statusFilter ? `?status=${statusFilter}` : "";
    const response = await axiosInstance.get(`/super-admin/settings/affiliates${query}`);
    return response.data; // Returns { success, count, data }
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const superAdminLogin = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  }
    catch (error) {
    throw error.response?.data || error;
  }
};
