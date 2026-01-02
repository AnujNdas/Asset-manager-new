const express = require("express");
const authenticateToken = require("../Middleware/Authentication-token");
const {
  previewPrice,
  createCheckout,
  handleWebhook,
  getTiers
} = require("../controllers/subscriptionController");

const router = express.Router();

router.post(
  "/preview-price",
  authenticateToken(),
  previewPrice
);
router.get("/tiers", getTiers);
router.post(
  "/create-checkout",
  authenticateToken(),
  createCheckout
);

router.post("/webhook", handleWebhook);

module.exports = router;
