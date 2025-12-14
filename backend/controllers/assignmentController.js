const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetAssignment = require("../models/AssetAssignment");

exports.assignAsset = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      assetType,
      assetId,
      assignedToType,
      assignedTo,
      quantity = 1,
    } = req.body;

    let asset;

    if (assetType === "hardware") {
      asset = await Asset.findById(assetId).session(session);

      if (!asset) throw new Error("Hardware asset not found");

      if (asset.inStock < quantity) {
        throw new Error("Not enough stock available");
      }

      asset.inUse += quantity;
      await asset.save({ session });
    }

    if (assetType === "software") {
      asset = await SoftwareAsset.findById(assetId).session(session);

      if (!asset) throw new Error("Software asset not found");

      const available =
        asset.totalLicenses - asset.licensesAssigned;

      if (available < quantity) {
        throw new Error("Not enough licenses available");
      }

      asset.licensesAssigned += quantity;
      await asset.save({ session });
    }

    const assignment = await AssetAssignment.create(
      [
        {
          assetType,
          assetId,
          assetModel:
            assetType === "hardware" ? "Asset" : "SoftwareAsset",
          assignedToType,
          assignedTo,
          quantity,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Asset assigned successfully",
      assignment: assignment[0],
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
exports.returnAsset = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { assignmentId } = req.params;

    const assignment = await AssetAssignment.findById(assignmentId).session(
      session
    );

    if (!assignment || assignment.status === "returned") {
      throw new Error("Invalid or already returned assignment");
    }

    if (assignment.assetType === "hardware") {
      await Asset.findByIdAndUpdate(
        assignment.assetId,
        { $inc: { inUse: -assignment.quantity } },
        { session }
      );
    }

    if (assignment.assetType === "software") {
      await SoftwareAsset.findByIdAndUpdate(
        assignment.assetId,
        { $inc: { licensesAssigned: -assignment.quantity } },
        { session }
      );
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

