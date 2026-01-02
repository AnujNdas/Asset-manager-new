const pricingTiers = require("../config/pricingTiers");
const Subscription = require("../models/Subscription");

const getTiers = (req, res) => {
  return res.json({
    success: true,
    tiers: pricingTiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      users: tier.users,
      assets: tier.assets,
      features: tier.features,
      popular: tier.popular,
      prices: {
        monthly: tier.priceMonthly,
        yearly: tier.priceYearly,
      },
      currency: "USD",
    })),
  });
};

const previewPrice = (req, res) => {
  const { tierId, billingCycle } = req.body;

  if (!tierId || !billingCycle) {
    return res.status(400).json({
      error: "tierId and billingCycle are required",
    });
  }

  const tier = pricingTiers.find((t) => t.id === tierId);

  if (!tier) {
    return res.status(400).json({
      error: "Invalid tier selected",
    });
  }

  const amount =
    billingCycle === "yearly"
      ? tier.priceYearly
      : tier.priceMonthly;

  return res.json({
    success: true,
    pricing: {
      tierId: tier.id,
      users: tier.users,
      assets: tier.assets,
      billingCycle,
      amount,
      currency: "USD",
    },
  });
};

const createCheckout = async (req, res) => {
  const { tierId, billingCycle } = req.body;
  const userId = req.user.id;

  const tier = pricingTiers.find((t) => t.id === tierId);

  if (!tier) {
    return res.status(400).json({ error: "Invalid tier" });
  }

await Subscription.create({
  userId,
  tierId: tier.id,

  usersLimit: tier.users,
  assetsLimit: tier.assets,

  billingCycle,

  amount:
    billingCycle === "yearly"
      ? tier.priceYearly
      : tier.priceMonthly,

  currency: "USD",

  status: "pending",
});


  // Placeholder until Lemon Squeezy is wired
  return res.json({
    checkoutUrl: "/billing/coming-soon",
  });
};

const handleWebhook = (req, res) => {
  // Lemon Squeezy webhook logic later
  res.status(200).send("ok");
};

module.exports = {
  previewPrice,
  createCheckout,
  handleWebhook,
  getTiers
};
