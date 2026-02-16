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
export const updateUnit = async (id, body) => {
  const res = await axiosInstance.put(`/unit/${id}`, body);
  return res.data;
};

export const deleteUnit = async (id) => {
  const response = await axiosInstance.delete(`/unit/${id}`);
  return response.data;
};
export const restoreUnit = async(id) => {
  const response = await axiosInstance.patch(`/unit/${id}/restore`);
  return response.data;
}
export const getDepartments = async () => {
  const response = await axiosInstance.get("/department");
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await axiosInstance.post("/department", departmentData);
  return response.data;
};
export const updateDepartment = async (id, body) => {
  const res = await axiosInstance.put(`/department/${id}`, body);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const response = await axiosInstance.delete(`/department/${id}`);
  return response.data;
};
export const restoreDepartment = async(id) => {
  const response = await axiosInstance.patch(`/department/${id}/restore`);
  return response.data;
}
// ----- LOCATION API CALLS -----
export const getLocations = async () => {
  const response = await axiosInstance.get("/location");
  return response.data;
};

export const createLocation = async (locationData) => {
  const response = await axiosInstance.post("/location", locationData);
  return response.data;
};
export const deleteLocation = async (id) => {
  const response = await axiosInstance.delete(`/location/${id}`);
  return response.data;
};
export const updateLocation = async (id, body) => {
  const res = await axiosInstance.put(`/location/${id}`, body);
  return res.data;
};
export const restoreLocation = async(id) => {
  const response = await axiosInstance.patch(`/location/${id}/restore`);
  return response.data;
}

// ----- CATEGORY API CALLS -----
export const getCategories = async () => {
  const response = await axiosInstance.get("/category");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post("/category", categoryData);
  return response.data;
};
export const updateCategory = async (id, body) => {
  const res = await axiosInstance.put(`/category/${id}`, body);
  return res.data;
};


export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/category/${id}`);
  return response.data;
};
export const restoreCategory = async(id) => {
  const response = await axiosInstance.patch(`/category/${id}/restore`);
  return response.data;
}

// ----- STATUS API CALLS -----
export const getStatuses = async () => {
  const response = await axiosInstance.get("/status");
  return response.data;
};

export const createStatus = async (statusData) => {
  const response = await axiosInstance.post("/status", statusData);
  return response.data;
};
export const deleteStatus = async (id) => {
  const response = await axiosInstance.delete(`/status/${id}`);
  return response.data;
};
export const updateStatus = async (id, body) => {
  const res = await axiosInstance.put(`/status/${id}`, body);
  return res.data;
};
export const restoreStatus = async(id) => {
  const response = await axiosInstance.patch(`/status/${id}/restore`);
  return response.data;
}
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
export const generateSoftwareAssetCode = async () => {
  const response = await axiosInstance.get("/software-assets/asset-code");
  return response.data.assetCode;
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
// ----- ASSET CODE GENERATION -----
export const generateHardwareAssetCode = async () => {
  const response = await axiosInstance.get("/assets/asset-code");
  return response.data.assetCode;
};

export const getHardwareAssetById = async (id) => {
  const response = await axiosInstance.get(`/assets/${id}`);
  return response.data;
};

export const updateHardwareAsset = async (id, data) => {
  const res = await axiosInstance.put(
    `/assets/${id}`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};
;



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
  const response = await axiosInstance.post(
    "/assets/bulk-upload",
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
      validateStatus: () => true, // ← prevents axios auto-throwing errors
    }
  );

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

export const getUserDashboard = async () => {
  const response = await axiosInstance.get("/user-data/dashboard");
  return response.data;
};

export const getMonthlySubscription = async () =>
  axiosInstance.get("/admin/software/monthly-subscriptions").then((res) => res.data);
export const getDistribution = async () =>
  axiosInstance.get("/admin/software/distribution").then((res) => res.data);

export const getSoftwareLicenseUtilization = async () => {
  const { data } = await axiosInstance.get(
    "/admin/software/license-utilization"
  );
  return data;
};
export const getUpcomingSoftwareExpiry = async () => {
  const { data } = await axiosInstance.get(
    "/admin/software/upcoming-expiry"
  );
  return data;
};

export const getHardwareMaintenanceDue = async () => {
  const res = await axiosInstance.get("/admin/maintenance-due");
  return {
    overdue: res.data?.data?.overdue || [],
    upcoming: res.data?.data?.upcoming || []
  };
};

export const getSoftwareCostMetrics = async () => {
  try {
    const res = await axiosInstance.get("/admin/cost-metrics");
    return res.data;
  } catch (error) {
    throw error?.response?.data || error.message;
  }
};
export const getDepartmentAssetDistribution = async () => {
  const res = await axiosInstance.get("/admin/asset-distribution");
  return res.data?.data || [];
};
export const assignUserToDepartment = async (userId, departmentId) => {
  const res = await axiosInstance.put(
    `/admin/users/${userId}/department`,
    { departmentId }
  );
  return res.data;
};
export const getUsersByDepartment = async (departmentId) => {
  if (!departmentId) {
    throw new Error("Department ID is required");
  }

  const response = await axiosInstance.get(`/assignment/department/${departmentId}`);

  return response.data;
};
export const getRecentAssets = async () =>
  axiosInstance.get("/admin/recent-assets").then((res) => res.data);

export const getActiveUsers = async () =>
  axiosInstance.get("/admin/active-users").then((res) => res.data);

export const getMonthlyValuation = async () =>
  axiosInstance.get("/admin/valuation-trend").then(res => res.data);
// ===============================
// ----- ASSIGNMENT / STOCK API CALLS -----
// ===============================

// Category-wise in-stock summary (Hardware + Software)
export const getInStockCategorySummary = async () => {
  const response = await axiosInstance.get(
    "/assignment/instock/category-summary"
  );
  return response.data;
};

// Get in-stock assets by category
export const getInStockAssetsByCategory = async (category) => {
  const response = await axiosInstance.get(
    `/assignment/instock/assets/${category}`
  );
  return response.data;
};

// Assign assets from stock (bulk, multi-department)
export const assignAssetsFromStock = async (assignments) => {
  /**
   * assignments = {
   *   assignments: [
   *     {
   *       assetType: "hardware" | "software",
   *       assetId: string,
   *       departmentId: string,
   *       quantity: number
   *     }
   *   ]
   * }
   */
  const response = await axiosInstance.post(
    "/assignment/instock/assign",
    assignments
  );
  return response.data;
};

// Return assigned asset
export const returnAssignedAsset = async (assignmentId) => {
  const response = await axiosInstance.put(
    `/assignment/return/${assignmentId}`
  );
  return response.data;
};
export const createInvite = async (data) => {
  const response = await axiosInstance.post("/invites", data);
  return response.data;
};

export const getInvites = async () => {

  const response = await axiosInstance.get("/invites");
  return response.data;
}
export const revokeInvite = async (id) => {
  const response = await axiosInstance.delete(`/invites/${id}`);
  return response.data;
}
export const createSupportTicket = async (data) => {
  const response = await axiosInstance.post("/support/tickets", data);
  return response.data;
}
export const getMySupportTickets = async () => {
  const response = await axiosInstance.get("/support/tickets/my");
  return response.data;
}
export const getAllSupportTickets = async () => {
  const response = await axiosInstance.get("/support/tickets");
  return response.data;
}
// UPDATE SUPPORT TICKET (ORG ADMIN)
export const updateSupportTicket = async (ticketId, payload) => {
  const res = await axiosInstance.patch(`/tickets/${ticketId}`, payload);
  return res.data;
};
export const contactSupport = async (data) => {
  const response = await axiosInstance.post("/support/contact", data);
  return response.data;
};
