const Hardware = require("../models/Asset");
const Software = require("../models/SoftwareAsset");
const User = require("../models/User");
const sendBrevoEmail = require("../utils/sendBrevoEmail");

const sendExpiryAlerts = async () => {
  try {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    /* ---------------- HARDWARE WARRANTY ---------------- */

    const warrantyAssets = await Hardware.find({
      "warranty.expiryDate": { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName warranty.expiryDate organizationId");

    /* ---------------- HARDWARE INSURANCE ---------------- */

    const insuranceAssets = await Hardware.find({
      "insurance.expiryDate": { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName insurance.expiryDate organizationId");

    /* ---------------- HARDWARE DOE ---------------- */

    const hardwareDOE = await Hardware.find({
      DOE: { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName DOE organizationId");

    /* ---------------- SOFTWARE DOE ---------------- */

    const softwareDOE = await Software.find({
      DOE: { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName DOE organizationId");

    /* ---------------- NORMALIZE DATA ---------------- */

    const allAssets = [

      ...warrantyAssets.map(a => ({
        _id: a._id,
        organizationId: a.organizationId,
        assetName: a.assetName,
        expiry: a.warranty.expiryDate,
        type: "Warranty"
      })),

      ...insuranceAssets.map(a => ({
        _id: a._id,
        organizationId: a.organizationId,
        assetName: a.assetName,
        expiry: a.insurance.expiryDate,
        type: "Insurance"
      })),

      ...hardwareDOE.map(a => ({
        _id: a._id,
        organizationId: a.organizationId,
        assetName: a.assetName,
        expiry: a.DOE,
        type: "Hardware Expiry"
      })),

      ...softwareDOE.map(a => ({
        _id: a._id,
        organizationId: a.organizationId,
        assetName: a.assetName,
        expiry: a.DOE,
        type: "Software Expiry"
      }))
    ];

    if (!allAssets.length) {
      console.log("No upcoming expiries found");
      return;
    }

    /* ---------------- GROUP BY ORGANIZATION ---------------- */

    const grouped = {};

    for (const asset of allAssets) {
      const orgId = asset.organizationId.toString();

      if (!grouped[orgId]) grouped[orgId] = [];

      grouped[orgId].push(asset);
    }

    /* ---------------- SEND EMAIL PER ORG ---------------- */

    for (const orgId in grouped) {
      const admin = await User.findOne({
        organizationId: orgId,
        role: "admin"
      });

      if (!admin) continue;

      const assets = grouped[orgId];

      const tableRows = assets
        .map(
          (a, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${a.assetName}</td>
            <td>${a.type}</td>
            <td>${new Date(a.expiry).toDateString()}</td>
          </tr>
        `
        )
        .join("");

      const html = `
        <h2>Upcoming Asset Expiry Alert</h2>
        <p>The following assets will expire within the next 7 days:</p>

        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>#</th>
            <th>Asset Name</th>
            <th>Type</th>
            <th>Expiry Date</th>
          </tr>

          ${tableRows}
        </table>

        <p>Please review these assets in the Asset Management System.</p>
      `;

      await sendBrevoEmail(
        admin.email,
        "Upcoming Asset Expiries (7 Days)",
        html
      );

      /* ---------------- MARK ALERT SENT ---------------- */

      const hardwareIds = assets
        .filter(a => a.type !== "Software Expiry")
        .map(a => a._id);

      const softwareIds = assets
        .filter(a => a.type === "Software Expiry")
        .map(a => a._id);

      if (hardwareIds.length) {
        await Hardware.updateMany(
          { _id: { $in: hardwareIds } },
          { $set: { expiryAlertSent: true } }
        );
      }

      if (softwareIds.length) {
        await Software.updateMany(
          { _id: { $in: softwareIds } },
          { $set: { expiryAlertSent: true } }
        );
      }

      console.log(`✅ Expiry alert sent to ${admin.email}`);
    }

  } catch (error) {
    console.error("❌ Expiry alert job error:", error);
  }
};

module.exports = sendExpiryAlerts;