const Organization = require("../models/Organization");

const cleanupInactiveOrganizations = async () => {

    try {

        console.log("Checking inactive organizations...");

        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

        const now = new Date();

        const cutoff = new Date(now.getTime() - THIRTY_DAYS);

        const organizations = await Organization.find({
            autoCleanup: true
        });

        console.log(`Found ${organizations.length} organizations`);

        for (const org of organizations) {

            if (!org.lastActivityAt) {

                console.log(
                    `${org.name} has never been active`
                );

                continue;
            }

            if (org.lastActivityAt < cutoff) {

                console.log(
                    `${org.name} inactive since ${org.lastActivityAt}`
                );

            }

        }

    }
    catch (err) {

        console.error(err);

    }

};

module.exports = cleanupInactiveOrganizations;