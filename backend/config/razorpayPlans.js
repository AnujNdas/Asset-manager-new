const plans = {
  base: {
    monthly: {
      test: "plan_SKhqqkAt4aPUqs",
      live: "REPLACE_WITH_LIVE_BASE_MONTHLY",
      price: 15,
    },
    yearly: {
      test: "plan_SKhtv8Cs9wgqdY",
      live: "REPLACE_WITH_LIVE_BASE_YEARLY",
      price: 144,
    },
  },

  grow: {
    monthly: {
      test: "plan_SKhs2rp6qvbN03",
      live: "REPLACE_WITH_LIVE_GROW_MONTHLY",
      price: 30,
    },
    yearly: {
      test: "plan_SKhuszhNt2e3zJ",
      live: "REPLACE_WITH_LIVE_GROW_YEARLY",
      price: 300,
    },
  },

  omni: {
    monthly: {
      test: "plan_SKhss5EprTkNEO",
      live: "REPLACE_WITH_LIVE_OMNI_MONTHLY",
      price: 80,
    },
    yearly: {
      test: "plan_SKhvuXApzWVu4z",
      live: "REPLACE_WITH_LIVE_OMNI_YEARLY",
      price: 900,
    },
  },
};

module.exports = plans;