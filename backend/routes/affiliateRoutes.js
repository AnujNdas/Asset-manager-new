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
const {
  getAffiliateEarnings,
} = require("../controllers/affiliate/affiliateEarning");
const affiliateAuth = require(
  "../Middleware/affiliateAuth"
);

router.post(
  "/apply",
  applyAffiliate
);
router.get(
  "/dashboard",
    affiliateAuth,
  getAffiliateDashboard
);
router.post(
  "/track",
  trackReferralVisit
);
router.get(
  "/earnings",
  affiliateAuth,
  getAffiliateEarnings
);
module.exports = router;