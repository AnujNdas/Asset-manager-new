const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");
const assignAssetsFromStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignments } = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new Error("No assignments provided");
    }

    const createdAssignments = [];

    for (const item of assignments) {
      const { assetType, assetId, departmentId, quantity } = item;

      if (quantity <= 0) {
        throw new Error("Invalid quantity");
      }

      let asset;

      // HARDWARE
      if (assetType === "hardware") {
        asset = await Asset.findById(assetId).session(session);
        if (!asset) throw new Error("Hardware asset not found");

        const inStock = asset.assetQuantity - asset.inUse;
        if (inStock < quantity) {
          throw new Error(`Insufficient stock for ${asset.assetName}`);
        }

        asset.inUse += quantity;
        await asset.save({ session });
      }

      // SOFTWARE
      if (assetType === "software") {
        asset = await SoftwareAsset.findById(assetId).session(session);
        if (!asset) throw new Error("Software asset not found");

        const available =
          asset.totalLicenses - asset.licensesAssigned;

        if (available < quantity) {
          throw new Error(`Insufficient licenses for ${asset.name}`);
        }

        asset.licensesAssigned += quantity;
        await asset.save({ session });
      }

      const assignment = await AssetAssignment.create(
        [
          {
            assetType,
            assetId,
            departmentId,
            quantity,
            status: "assigned",
          },
        ],
        { session }
      );

      createdAssignments.push(assignment[0]);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Assets assigned successfully",
      assignments: createdAssignments,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
;
const returnAsset = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.params;

    const assignment = await AssetAssignment.findById(assignmentId).session(session);

    if (!assignment || assignment.status === "returned") {
      throw new Error("Invalid or already returned assignment");
    }

    if (assignment.assetType === "hardware") {
      const asset = await Asset.findById(assignment.assetId).session(session);
      if (!asset || asset.inUse < assignment.quantity) {
        throw new Error("Invalid hardware stock state");
      }

      asset.inUse -= assignment.quantity;
      await asset.save({ session });
    }

    if (assignment.assetType === "software") {
      const asset = await SoftwareAsset.findById(assignment.assetId).session(session);
      if (!asset || asset.licensesAssigned < assignment.quantity) {
        throw new Error("Invalid license state");
      }

      asset.licensesAssigned -= assignment.quantity;
      await asset.save({ session });
    }

    assignment.status = "returned";
    assignment.returnedAt = new Date();
    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Asset returned successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { assignAssetsFromStock , returnAsset };
