// src/Services/ApiServices.js
import axiosInstance from "./axiosInstance";

// ----- UNIT API CALLS -----
export const getUnits = async () => {
  const response = await axiosInstance.get("/unit");
  return response.data;
};

export const createUnit = async (unitData) => {
  const response = await axiosInstance.post("/unit", unitData);
  return response.data;
};

// ----- LOCATION API CALLS -----
export const getLocations = async () => {
  const response = await axiosInstance.get("/location");
  return response.data;
};

export const createLocation = async (locationData) => {
  const response = await axiosInstance.post("/location", locationData);
  return response.data;
};

// ----- CATEGORY API CALLS -----
export const getCategories = async () => {
  const response = await axiosInstance.get("/category");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post("/category", categoryData);
  return response.data;
};

// ----- STATUS API CALLS -----
export const getStatuses = async () => {
  const response = await axiosInstance.get("/status");
  return response.data;
};

export const createStatus = async (statusData) => {
  const response = await axiosInstance.post("/status", statusData);
  return response.data;
};

// ----- SOFTWARE ASSETS API CALLS -----
export const getSoftwareAssets = async () => {
  const response = await axiosInstance.get("/software-assets");
  return response.data;
};

export const createSoftwareAsset = async (assetData) => {
  const response = await axiosInstance.post("/software-assets", assetData);
  return response.data;
};

export const getSoftwareAssetById = async (id) => {
  const response = await axiosInstance.get(`/software-assets/${id}`);
  return response.data;
};

export const updateSoftwareAsset = async (id, updatedData) => {
  const response = await axiosInstance.put(`/software-assets/${id}`, updatedData);
  return response.data;
};

export const deleteSoftwareAsset = async (id) => {
  const response = await axiosInstance.delete(`/software-assets/${id}`);
  return response.data;
};

// ----- HARDWARE ASSETS API CALLS -----
export const createHardwareAsset = async (assetData) => {
  const response = await axiosInstance.post("/assets", assetData);
  return response.data;
};
// ----- HARDWARE ASSETS API CALLS -----
export const getHardwareAssets = async () => {
  const response = await axiosInstance.get("/assets");
  return response.data;
};

export const getHardwareAssetById = async (id) => {
  const response = await axiosInstance.get(`/assets/${id}`);
  return response.data;
};

export const updateHardwareAsset = async (id, data) => {
  return axiosInstance.put(`/assets/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


export const deleteHardwareAsset = async (id) => {
  const response = await axiosInstance.delete(`/assets/${id}`);
  return response.data;
};


// ----- CORE COMPANY LICENSE API CALLS -----
export const getCoreLicenses = async () => {
  const response = await axiosInstance.get("/company-licenses");
  return response.data;
};

export const createCoreLicense = async (licenseData) => {
  const response = await axiosInstance.post("/company-licenses", licenseData);
  return response.data;
};

export const getCoreLicenseById = async (id) => {
  const response = await axiosInstance.get(`/company-licenses/${id}`);
  return response.data;
};

export const updateCoreLicense = async (id, updatedData) => {
  const response = await axiosInstance.put(`/company-licenses/${id}`, updatedData);
  return response.data;
};

export const deleteCoreLicense = async (id) => {
  const response = await axiosInstance.delete(`/company-licenses/${id}`);
  return response.data;
};


export const bulkUploadHardwareAssets = async (data) => {
  const response = await axiosInstance.post("/assets/bulk-upload", data);
  return response.data;
};



export const bulkUploadSoftwareAssets = async (data) => {
  const response = await axiosInstance.post("/software-assets/bulk-upload",data );
  return response.data;
};

export const bulkUploadCoreLicenses = async (data) => {
  const response = await axiosInstance.post("/company-licenses/bulk-upload", data);
  return response.data;
};

// ----- ADMIN API CALLS -----
export const getAdminStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};
