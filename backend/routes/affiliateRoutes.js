// routes/affiliateRoutes.js

const express = require("express");

const router = express.Router();
const {
  getAffiliateProfileSettings,
  updateAffiliateProfileSettings,
  getAffiliatePayoutSettings,
  updateAffiliatePayoutSettings,
  getAffiliatePreferences,
  updateAffiliatePreferences,
} = require("../controllers/affiliate/settingsController");

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
const {
  createAffiliateTicket,
  getAffiliateTickets,
  getAffiliateTicketById,
} = require("../controllers/affiliate/affiliateTicket");

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

router.get("/settings/profile",affiliateAuth, getAffiliateProfileSettings);
router.put("/settings/profile", affiliateAuth, updateAffiliateProfileSettings);

router.get("/settings/payout", affiliateAuth, getAffiliatePayoutSettings);
router.put("/settings/payout", affiliateAuth, updateAffiliatePayoutSettings);

router.get("/settings/preferences", affiliateAuth, getAffiliatePreferences);
router.put("/settings/preferences", affiliateAuth, updateAffiliatePreferences);
router.post(
  "/tickets",
  affiliateAuth,
  createAffiliateTicket
);

router.get(
  "/tickets",
  affiliateAuth,
  getAffiliateTickets
);

router.get(
  "/tickets/:id",
  affiliateAuth,
  getAffiliateTicketById
);
module.exports = router;