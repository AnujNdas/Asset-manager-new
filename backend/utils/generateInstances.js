const AssetInstance = require("../models/AssetInstance");

const generateInstances = async ({
  asset,
  quantity,
  assetType,
  userId
}) => {
  const instances = [];

  const assetTypeRef =
    assetType === "hardware" ? "Asset" : "SoftwareAsset";

  for (let i = 1; i <= quantity; i++) {
    instances.push({
      organizationId: asset.organizationId,
      assetId: asset._id,
      assetType,
      assetTypeRef,

      instanceCode: `${asset.assetCode}-${String(i).padStart(2, "0")}`,

      status: "in_stock",

      lifecycle: [
        {
          action: "CREATED",
          notes: "Instance created during asset creation"
        }
      ],

      createdBy: userId
    });
  }

  return await AssetInstance.insertMany(instances);
};

module.exports = generateInstances;