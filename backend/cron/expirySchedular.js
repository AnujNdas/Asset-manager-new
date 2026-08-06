const cron = require("node-cron");

const sendExpiryAlerts = require("../jobs/sendExpiryAlerts");
const cleanupInactiveOrganizations = require("../jobs/cleanupInactiveOrganizations");

// Run once on server startup (optional)
sendExpiryAlerts();
cleanupInactiveOrganizations();

// Every day at 9 AM
cron.schedule("0 9 * * *", async () => {

    console.log("Running Daily Jobs...");

    await sendExpiryAlerts();

    await cleanupInactiveOrganizations();

});