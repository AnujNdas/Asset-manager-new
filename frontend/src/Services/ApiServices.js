import axiosInstance from "./axiosInstance";

// Utility: always return array if expected
const safeArray = (data) => (Array.isArray(data) ? data : []);

// Utility: always return object if expected
const safeObject = (data) =>
  data && typeof data === "object" && !Array.isArray(data) ? data : {};

// ----- UNIT API CALLS -----
export const getUnits = async () => {
  const res = await axiosInstance.get("/unit");
  return safeArray(res.data);
};
export const createUnit = async (unitData) => {
  const res = await axiosInstance.post("/unit", unitData);
  return safeObject(res.data);
};

// ----- LOCATION API CALLS -----
export const getLocations = async () => {
  const res = await axiosInstance.get("/location");
  return safeArray(res.data);
};
export const createLocation = async (locationData) => {
  const res = await axiosInstance.post("/location", locationData);
  return safeObject(res.data);
};

// ----- CATEGORY API CALLS -----
export const getCategories = async () => {
  const res = await axiosInstance.get("/category");
  return safeArray(res.data);
};
export const createCategory = async (categoryData) => {
  const res = await axiosInstance.post("/category", categoryData);
  return safeObject(res.data);
};

// ----- STATUS API CALLS -----
export const getStatuses = async () => {
  const res = await axiosInstance.get("/status");
  return safeArray(res.data);
};
export const createStatus = async (statusData) => {
  const res = await axiosInstance.post("/status", statusData);
  return safeObject(res.data);
};

// ----- SOFTWARE ASSETS API CALLS -----
export const getSoftwareAssets = async () => {
  const res = await axiosInstance.get("/software-assets");
  return safeArray(res.data);
};
export const createSoftwareAsset = async (assetData) => {
  const res = await axiosInstance.post("/software-assets", assetData);
  return safeObject(res.data);
};
export const getSoftwareAssetById = async (id) => {
  const res = await axiosInstance.get(`/software-assets/${id}`);
  return safeObject(res.data);
};
export const updateSoftwareAsset = async (id, updatedData) => {
  const res = await axiosInstance.put(`/software-assets/${id}`, updatedData);
  return safeObject(res.data);
};
export const deleteSoftwareAsset = async (id) => {
  const res = await axiosInstance.delete(`/software-assets/${id}`);
  return safeObject(res.data);
};

// ----- HARDWARE ASSETS API CALLS -----
export const createHardwareAsset = async (assetData) => {
  const res = await axiosInstance.post("/assets", assetData);
  return safeObject(res.data);
};

// ----- CORE COMPANY LICENSE API CALLS -----
export const getCoreLicenses = async () => {
  const res = await axiosInstance.get("/company-licenses");
  return safeArray(res.data);
};
export const createCoreLicense = async (licenseData) => {
  const res = await axiosInstance.post("/company-licenses", licenseData);
  return safeObject(res.data);
};
export const getCoreLicenseById = async (id) => {
  const res = await axiosInstance.get(`/company-licenses/${id}`);
  return safeObject(res.data);
};
export const updateCoreLicense = async (id, updatedData) => {
  const res = await axiosInstance.put(`/company-licenses/${id}`, updatedData);
  return safeObject(res.data);
};
export const deleteCoreLicense = async (id) => {
  const res = await axiosInstance.delete(`/company-licenses/${id}`);
  return safeObject(res.data);
};

// ----- BULK UPLOAD API CALLS -----
export const bulkUploadHardwareAssets = async (data) => {
  const res = await axiosInstance.post("/assets/bulk-upload", { assets: data });
  return safeObject(res.data);
};
export const bulkUploadSoftwareAssets = async (data) => {
  const res = await axiosInstance.post("/software-assets/bulk-upload", { assets: data });
  return safeObject(res.data);
};
export const bulkUploadCoreLicenses = async (data) => {
  const res = await axiosInstance.post("/company-licenses/bulk-upload", { assets: data });
  return safeObject(res.data);
};

// ----- ADMIN API CALLS -----
export const getAdminStats = async () => {
  const res = await axiosInstance.get("/admin/stats");
  return safeObject(res.data);
};
export const getAllUsers = async () => {
  const res = await axiosInstance.get("/admin/users");
  return safeArray(res.data);
};
export const updateUserRole = async (userId, role) => {
  const res = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
  return safeObject(res.data);
};
