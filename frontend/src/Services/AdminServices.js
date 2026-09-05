import axiosInstance from "./axiosInstance";

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
    "/subscription",
  );
  return res.data;
};
