// routes/affiliateRoutes.js

const express = require("express");

const router = express.Router();

const {
  applyAffiliate,
} = require("../controllers/affiliate/applyAffiliate");
const {
  trackReferralVisit,
} = require("../controllers/affiliate/trackReferralVisit");
const {
  getAffiliateDashboard,
} = require("../controllers/affiliate/affiliateDashboard");
router.post(
  "/apply",
  applyAffiliate
);
router.get(
  "/dashboard",
  getAffiliateDashboard
);
router.post(
  "/track",
  trackReferralVisit
);
module.exports = router;