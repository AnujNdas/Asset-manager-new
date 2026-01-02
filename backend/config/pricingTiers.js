// config/pricingTiers.js
module.exports = [
  {
    id: "tier_10_1000",
    name: "Starter",
    users: 10,
    assets: 1000,
    priceMonthly: 15,
    priceYearly: 216,
    currency: "USD",
    popular: false,

    features: [
      "Up to 10 users",
      "Up to 1,000 assets",
      "Hardware & software tracking",
      "Basic reports",
      "Email support",
    ],
  },

  {
    id: "tier_20_2500",
    name: "Growth",
    users: 20,
    assets: 2500,
    priceMonthly: 30,
    priceYearly: 432,
    currency: "USD",
    popular: true,

    features: [
      "Up to 20 users",
      "Up to 2,500 assets",
      "Advanced reports",
      "Role-based access",
      "Priority support",
    ],
  },

  {
    id: "tier_50_5000",
    name: "Scale",
    users: 50,
    assets: 5000,
    priceMonthly: 100,
    priceYearly: 1080,
    currency: "USD",
    popular: false,

    features: [
      "Up to 50 users",
      "Up to 5,000 assets",
      "Audit logs",
      "Custom roles",
      "Dedicated support",
    ],
  },
];
