const cron = require("node-cron");
const sendExpiryAlerts = require("../jobs/sendExpiryAlerts");

cron.schedule("0 9 * * *", async () => {
  console.log("Running expiry alert cron...");
  await sendExpiryAlerts();
});