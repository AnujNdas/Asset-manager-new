export const PLANS = {


  STARTER: {
    code: "NORMAL",
    name: "normal",
    priceMonthly: "20$",
    priceYearly: "240$",
    pricemultipleYearly: "460$",
    limits: {
      assets: 5000,
      users: 10,
      reports: true,
    },
  },

  ENTERPRISE: {
    code: "ENTERPRISE",
    name: "Enterprise",
    priceMonthly: "50$",
    priceYearly: "600$",
    pricemultipleYearly: "1150$",
    limits: {
      assets: 10000,
      users: 20,
      reports: true,
    },
  },
};
