const Organization = require("../models/Organization");
const User = require("../models/User");
const cleanupInactiveOrganizations = async () => {

    try {

        console.log("Checking inactive organizations...");

        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

        const now = new Date();

        const cutoff = new Date(now.getTime() - THIRTY_DAYS);

const organizations = await Organization.find();

console.log(`Found ${organizations.length} organizations`);
for (const org of organizations) {

    console.log(`\nChecking organization: ${org.name}`);

    const users = await User.find({
        organizationId: org._id
    }).select(
        "username email role lastActive createdAt"
    );

    // --------------------------
    // No users at all
    // --------------------------

    if (users.length === 0) {

        console.log("No users found.");

        // We'll delete these later.
        continue;
    }

    // --------------------------
    // Find the admin
    // --------------------------

    const admin =
        users.find(u => u.role === "admin") ||
        users[0];

    console.log(
        `Admin: ${admin.email}`
    );

    // --------------------------
    // Determine last activity
    // --------------------------

    const lastActivity =
        admin.lastActive || admin.createdAt;

    const inactiveDays = Math.floor(
        (Date.now() - new Date(lastActivity).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    console.log(
        `Inactive for ${inactiveDays} days`
    );

    if (inactiveDays >= 30) {

        console.log(
            `${org.name} is INACTIVE`
        );

    } else {

        console.log(
            `${org.name} is ACTIVE`
        );

    }

}

    }
    catch (err) {

        console.error(err);

    }

};

module.exports = cleanupInactiveOrganizations;