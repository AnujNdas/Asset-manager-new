const cron = require("node-cron");
const sendExpiryAlerts = require("../jobs/sendExpiryAlerts");
// run once immediately (for testing)
sendExpiryAlerts();
cron.schedule("0 9 * * *", async () => {
  console.log("Running expiry alert cron...");
  await sendExpiryAlerts();
});