const Organization = require("../models/Organization");
const User = require("../models/User");
const sendBrevoEmail = require("../utils/sendBrevoEmail");
const deleteOrganizationCompletely =
require("../services/organizationCleanupService");

const cleanupInactiveOrganizations = async () => {

    try {

        console.log("Checking inactive organizations...");

        const now = new Date();

        const INACTIVE_DAYS = 30;
        const GRACE_DAYS = 4;

        const organizations = await Organization.find();

        console.log(`Found ${organizations.length} organizations`);

        for (const org of organizations) {

            console.log(`\nChecking organization: ${org.name}`);

            const users = await User.find({
                organizationId: org._id
            }).select(
                "username email role lastActive createdAt"
            );

            let admin = null;
            let inactiveDays = 0;
            let reason = "";

            // ===========================================
            // CASE 1 : NO USERS
            // ===========================================

            if (users.length === 0) {

                const ageDays = Math.floor(
                    (now - new Date(org.createdAt)) /
                    (1000 * 60 * 60 * 24)
                );

                console.log(
                    `${org.name} has no users (${ageDays} days old)`
                );

                if (ageDays < INACTIVE_DAYS) {
                    continue;
                }

                admin = await User.findById(org.createdBy)
                    .select("email username");

                if (!admin) {
                    console.log("Creator no longer exists.");
                    continue;
                }

                inactiveDays = ageDays;
                reason = "NO_USERS";

            }

            // ===========================================
            // CASE 2 : USERS EXIST
            // ===========================================

            else {

                admin =
                    users.find(u => u.role === "admin") ||
                    users[0];

        const latestActivity = users.reduce((latest, user) => {

    const activity =
        user.lastActive || user.createdAt;

    return activity > latest ? activity : latest;

}, new Date(0));

inactiveDays = Math.floor(
    (now - latestActivity) /
    (1000 * 60 * 60 * 24)
);

                console.log(
                    `Inactive for ${inactiveDays} days`
                );

                // ------------------------------------
                // Organization became active again
                // ------------------------------------

                if (inactiveDays < INACTIVE_DAYS) {

                    if (org.status === "pending_deletion") {

                        console.log(
                            `${org.name} restored`
                        );

                        org.status = "active";
                        org.warningEmailSentAt = null;
                        org.scheduledDeletionAt = null;
                        org.cleanupReason = null;
                        org.finalReminderSentAt = null;

                        await org.save();

                    }

                    continue;

                }

                reason = "INACTIVE_ADMIN";

            }

            // ===========================================
            // SEND FIRST WARNING
            // ===========================================

            if (!org.warningEmailSentAt) {

                console.log(
                    `Sending warning to ${admin.email}`
                );

                const html =
                    reason === "NO_USERS"

                        ? `
                        <h2>Organization Scheduled For Removal</h2>

                        <p>
                        Your organization
                        <strong>${org.name}</strong>
                        currently has no users.
                        </p>

                        <p>
                        If no one joins or logs in within the next
                        <strong>4 days</strong>,
                        your organization and all associated data
                        will be permanently removed.
                        </p>

                        <p>
                        Simply logging in will cancel the deletion.
                        </p>
                        `

                        : `
                        <h2>Organization Inactive</h2>

                        <p>
                        Your organization
                        <strong>${org.name}</strong>
                        has been inactive for
                        <strong>${inactiveDays} days</strong>.
                        </p>

                        <p>
                        If nobody logs in within the next
                        <strong>4 days</strong>,
                        your organization and all associated data
                        will be permanently removed.
                        </p>

                        <p>
                        Simply logging in will cancel the deletion.
                        </p>
                        `;

                await sendBrevoEmail(
                    admin.email,
                    "⚠ Organization Scheduled For Removal",
                    html
                );

                org.status = "pending_deletion";

                org.warningEmailSentAt = now;

                org.scheduledDeletionAt =
                    new Date(
                        now.getTime() +
                        GRACE_DAYS * 24 * 60 * 60 * 1000
                    );

                org.cleanupReason = reason;

                await org.save();

                console.log("Warning email sent.");

                continue;

            }

            // ===========================================
            // FINAL REMINDER (24 HOURS LEFT)
            // ===========================================

            const oneDayBeforeDeletion =
                new Date(
                    org.scheduledDeletionAt.getTime() -
                    (24 * 60 * 60 * 1000)
                );

            if (

                !org.finalReminderSentAt &&

                now >= oneDayBeforeDeletion &&

                now < org.scheduledDeletionAt

            ) {

                await sendBrevoEmail(

                    admin.email,

                    "⏳ Final Reminder - Organization Deletion",

                    `
                    <h2>Final Reminder</h2>

                    <p>
                    Your organization
                    <strong>${org.name}</strong>
                    will be deleted in
                    <strong>24 hours</strong>.
                    </p>

                    <p>
                    Simply logging into your account
                    will immediately cancel the deletion.
                    </p>
                    `
                );

                org.finalReminderSentAt = now;

                await org.save();

                console.log("Final reminder sent.");

            }

            // ===========================================
            // DELETE
            // ===========================================

            if (
    org.scheduledDeletionAt &&
    now >= org.scheduledDeletionAt
) {

    console.log(
        `${org.name} ready for deletion`
    );

    await deleteOrganizationCompletely(
        org._id
    );

}

        }

    }

    catch (err) {

        console.error(
            "Cleanup Error:",
            err
        );

    }

};

module.exports = cleanupInactiveOrganizations;