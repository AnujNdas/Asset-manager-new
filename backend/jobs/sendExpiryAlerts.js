const Hardware = require("../models/Asset");
const Software = require("../models/SoftwareAsset");
const User = require("../models/User");
const sendBrevoEmail = require("../utils/sendBrevoEmail");

const sendExpiryAlerts = async () => {
  try {
    console.log("🚀 Expiry Alert Job Started");

    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    console.log("📅 Checking assets between:", today, "and", next7Days);

    /* ---------------- HARDWARE WARRANTY ---------------- */

    const warrantyAssets = await Hardware.find({
      "warranty.expiryDate": { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName warranty.expiryDate organizationId");

    console.log("🔧 Warranty assets found:", warrantyAssets.length);

    /* ---------------- HARDWARE INSURANCE ---------------- */

    const insuranceAssets = await Hardware.find({
      "insurance.expiryDate": { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName insurance.expiryDate organizationId");

    console.log("🛡 Insurance assets found:", insuranceAssets.length);

    /* ---------------- HARDWARE DOE ---------------- */

    const hardwareDOE = await Hardware.find({
      DOE: { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName DOE organizationId");

    console.log("💻 Hardware DOE assets found:", hardwareDOE.length);

    /* ---------------- SOFTWARE DOE ---------------- */

    const softwareDOE = await Software.find({
      DOE: { $gte: today, $lte: next7Days },
      expiryAlertSent: false
    }).select("_id assetName DOE organizationId");

    console.log("🧾 Software DOE assets found:", softwareDOE.length);

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

    console.log("📦 Total expiring assets:", allAssets.length);

    if (!allAssets.length) {
      console.log("⚠️ No upcoming expiries found");
      return;
    }

    /* ---------------- GROUP BY ORGANIZATION ---------------- */

    const grouped = {};

    for (const asset of allAssets) {
      const orgId = asset.organizationId.toString();

      if (!grouped[orgId]) grouped[orgId] = [];

      grouped[orgId].push(asset);
    }

    console.log("🏢 Organizations with expiries:", Object.keys(grouped).length);

    /* ---------------- SEND EMAIL PER ORG ---------------- */

    for (const orgId in grouped) {
      console.log(`\n📨 Processing organization: ${orgId}`);

      const admin = await User.findOne({
        organizationId: orgId,
        role: "admin"
      });

      if (!admin) {
        console.log(`❌ No admin found for organization ${orgId}`);
        continue;
      }

      console.log(`👤 Admin found: ${admin.email}`);

      const assets = grouped[orgId];

      console.log(`📊 Assets to notify: ${assets.length}`);

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

      console.log("📤 Sending email to:", admin.email);

      await sendBrevoEmail(
        admin.email,
        "Upcoming Asset Expiries (7 Days)",
        html
      );

      console.log("✅ Email sent successfully");

      /* ---------------- MARK ALERT SENT ---------------- */

      const hardwareIds = assets
        .filter(a => a.type !== "Software Expiry")
        .map(a => a._id);

      const softwareIds = assets
        .filter(a => a.type === "Software Expiry")
        .map(a => a._id);

      if (hardwareIds.length) {
        console.log("🔧 Updating hardware assets:", hardwareIds.length);

        await Hardware.updateMany(
          { _id: { $in: hardwareIds } },
          { $set: { expiryAlertSent: true } }
        );
      }

      if (softwareIds.length) {
        console.log("🧾 Updating software assets:", softwareIds.length);

        await Software.updateMany(
          { _id: { $in: softwareIds } },
          { $set: { expiryAlertSent: true } }
        );
      }

      console.log(`🎉 Expiry alert completed for ${admin.email}`);
    }

    console.log("\n🏁 Expiry Alert Job Finished\n");

  } catch (error) {
    console.error("❌ Expiry alert job error:", error);
  }
};

module.exports = sendExpiryAlerts;