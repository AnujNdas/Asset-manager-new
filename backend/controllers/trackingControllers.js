// GET /instances/tracking
const mongoose = require("mongoose")

const getTrackedInstances = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    const query = {
      organizationId: req.user.organizationId
    };

    /* =============================
       FILTER: TYPE
    ============================== */
    if (type && type !== "all") {
      query.assetType = type;
    }

    /* =============================
       FILTER: STATUS (optional)
    ============================== */
    if (status && status !== "all") {
      query.status = status;
    }

    /* =============================
       SEARCH (instanceCode / serial)
    ============================== */
    if (search) {
      query.$or = [
        { instanceCode: { $regex: search, $options: "i" } },
        { uniqueIdentifier: { $regex: search, $options: "i" } }
      ];
    }

    const instances = await mongoose
      .model("AssetInstance")
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: instances.length,
      data: instances
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// GET /instances/:id/history

const getInstanceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const instance = await mongoose.model("AssetInstance")
      .findOne({
        _id: id,
        organizationId: req.user.organizationId
      })
      .lean();

    if (!instance) {
      return res.status(404).json({
        success: false,
        message: "Instance not found"
      });
    }

    const history = (instance.lifecycle || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// PUT /instances/:id/upgrade

const upgradeInstance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const {
      maintenanceCost,
      warrantyRenewalCost,
      insuranceCost,
      newWarrantyExpiry,
      newInsuranceExpiry,
      condition
    } = req.body;

    const instance = await mongoose.model("AssetInstance")
      .findOne({
        _id: id,
        organizationId: req.user.organizationId
      })
      .session(session);

    if (!instance) throw new Error("Instance not found");

    /* =============================
       COST UPDATES
    ============================== */

    if (maintenanceCost) {
      instance.costTracking.maintenanceCost =
        (instance.costTracking.maintenanceCost || 0) + maintenanceCost;
    }

    if (warrantyRenewalCost) {
      instance.costTracking.warrantyRenewalCost =
        (instance.costTracking.warrantyRenewalCost || 0) + warrantyRenewalCost;
    }

    if (insuranceCost) {
      instance.costTracking.insuranceCost =
        (instance.costTracking.insuranceCost || 0) + insuranceCost;
    }

    /* =============================
       WARRANTY / INSURANCE
    ============================== */

    if (newWarrantyExpiry) {
      instance.warranty.expiryDate = newWarrantyExpiry;
      instance.warranty.status = "active";
    }

    if (newInsuranceExpiry) {
      instance.insurance.expiryDate = newInsuranceExpiry;
    }

    /* =============================
       CONDITION
    ============================== */

    if (condition) {
      instance.condition = condition;
    }

    /* =============================
       LIFECYCLE LOG
    ============================== */

    instance.lifecycle.push({
      action: "UPGRADE",
      from: null,
      to: {
        employeeName: instance.assignedTo?.employeeName || null,
        departmentName: instance.assignedTo?.departmentName || null
      },
      date: new Date(),
      notes: "Upgrade applied"
    });

    await instance.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Instance upgraded successfully",
      data: instance
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
module.exports = {
    getInstanceHistory,
    upgradeInstance,
    getTrackedInstances
}