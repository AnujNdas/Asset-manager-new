// routes/affiliateRoutes.js

const express = require("express");

const router = express.Router();

const {
  applyAffiliate,
} = require("../controllers/affiliate/applyAffiliate");

router.post(
  "/apply",
  applyAffiliate
);

module.exports = router;