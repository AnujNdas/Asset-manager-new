const express = require("express");
const router = express.Router();

const authenticateToken = require("../Middleware/Authentication-token");

const { getOverview } = require("../controllers/superAdmin/dashboardController");
const { getAllOrganizations, createOrganization , getOrganizationById ,toggleOrganizationStatus , getOrganizationUsers  } = require("../controllers/superAdmin/organizationController");
const {getSettings, updateSettings , resolveAffiliateTicket} = require("../controllers/superAdmin/settingController");
// const { getGAAnalytics } = require("../controllers/superAdmin/gaAnalysisController");
const { getLoginActivity } = require("../controllers/superAdmin/loginActivityController");
const { getAllAffiliateTickets} = require("../controllers/affiliate/affiliateTicket");


/* ================= DASHBOARD ================= */
router.get("/dashboard/overview", authenticateToken(["super-admin"]), getOverview);

/* ================= ORGANIZATIONS ================= */
router.get("/organizations", authenticateToken(["super-admin"]), getAllOrganizations);
router.get("/organizations/:id/users", authenticateToken(["super-admin"]), getOrganizationUsers);
router.post("/organizations", authenticateToken(["super-admin"]), createOrganization);
router.get("/organizations/:id", authenticateToken(["super-admin"]), getOrganizationById);
router.patch("/organizations/:id/status", authenticateToken(["super-admin"]), toggleOrganizationStatus);

/* ================= SETTINGS ================= */
router.get("/settings", authenticateToken(["super-admin"]), getSettings);
router.put("/settings", authenticateToken(["super-admin"]), updateSettings);
// router.get(
//   "/analytics/ga",
//   authenticateToken(["super-admin"]),
//   getGAAnalytics
// );
router.get(
  "/login-activity",
  authenticateToken(["super-admin"]),
  getLoginActivity
);
router.get(
  "/affiliate-tickets",
  authenticateToken(["super-admin"]),
  getAllAffiliateTickets
);

router.patch(
  "/affiliate-tickets/:id/resolve",
  authenticateToken(["super-admin"]),
  resolveAffiliateTicket
);
module.exports = router;
