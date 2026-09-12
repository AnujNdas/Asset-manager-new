const Organization = require("../models/Organization");
const User = require("../models/User");
const sendBrevoEmail = require("../utils/sendBrevoEmail");
const deleteOrganizationCompletely = require(
    "../services/organizationCleanupService"
);

const DAY_MS = 24 * 60 * 60 * 1000;

const INACTIVE_DAYS = 30;
const GRACE_DAYS = 4;
const FINAL_REMINDER_HOURS = 24;

// --------------------------------------------------
// Safe date parser
// --------------------------------------------------

const getValidDate = (value, fallback = null) => {
    if (!value) return fallback;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? fallback
        : date;
};

// --------------------------------------------------
// Safe organization display name
// Does not modify the database.
// --------------------------------------------------

const getOrganizationName = (org) => {
    if (
        typeof org.name === "string" &&
        org.name.trim().length > 0
    ) {
        return org.name.trim();
    }

    return `Organization ${String(org._id)}`;
};

// --------------------------------------------------
// Safe admin/creator lookup
// --------------------------------------------------

const findOrganizationAdmin = async (org, users = []) => {
    const existingAdmin =
        users.find((user) => user.role === "admin") ||
        users.find((user) => user.role === "super-admin");

    if (existingAdmin) {
        return existingAdmin;
    }

    if (org.createdBy) {
        const creator = await User.findById(org.createdBy)
            .select("_id email username role lastActive createdAt")
            .lean();

        if (creator) {
            return creator;
        }
    }

    return users[0] || null;
};

// --------------------------------------------------
// Safe latest activity calculation
// --------------------------------------------------

const getLatestActivity = (users, organization) => {
    const dates = [];

    for (const user of users) {
        const lastActive = getValidDate(user.lastActive);
        const createdAt = getValidDate(user.createdAt);

        if (lastActive) dates.push(lastActive);
        else if (createdAt) dates.push(createdAt);
    }

    const organizationUpdatedAt =
        getValidDate(organization.updatedAt);

    const organizationCreatedAt =
        getValidDate(organization.createdAt);

    if (organizationUpdatedAt) {
        dates.push(organizationUpdatedAt);
    }

    if (organizationCreatedAt) {
        dates.push(organizationCreatedAt);
    }

    if (dates.length === 0) {
        return null;
    }

    return dates.reduce((latest, current) => {
        return current > latest ? current : latest;
    }, new Date(0));
};

// --------------------------------------------------
// Update only cleanup fields.
// This avoids validating legacy invalid fields such as:
// name: ""
// organizationType: ""
// --------------------------------------------------

const updateCleanupFields = async (organizationId, update) => {
    await Organization.updateOne(
        { _id: organizationId },
        update,
        {
            runValidators: false
        }
    );
};

// --------------------------------------------------
// Main cleanup job
// --------------------------------------------------

const cleanupInactiveOrganizations = async () => {
    console.log("Checking inactive organizations...");

    const now = new Date();

    let organizations = [];

    try {
        // lean() prevents unnecessary Mongoose document validation
        organizations = await Organization.find({}).lean();

        console.log(
            `Found ${organizations.length} organizations`
        );
    } catch (error) {
        console.error(
            "Unable to load organizations:",
            error
        );

        return;
    }

    for (const org of organizations) {
        const organizationId = org._id;
        const organizationName = getOrganizationName(org);

        try {
            console.log(
                `\nChecking organization: ${organizationName} (${organizationId})`
            );

            const users = await User.find({
                organizationId
            })
                .select(
                    "_id username email role lastActive createdAt"
                )
                .lean();

            const admin = await findOrganizationAdmin(
                org,
                users
            );

            const organizationCreatedAt =
                getValidDate(org.createdAt, now);

            const organizationAgeDays = Math.max(
                0,
                Math.floor(
                    (now - organizationCreatedAt) / DAY_MS
                )
            );

            let inactiveDays = 0;
            let reason = null;

            // ==================================================
            // CASE 1: ORGANIZATION HAS NO USERS
            // ==================================================

            if (users.length === 0) {
                console.log(
                    `${organizationName} has no users. Age: ${organizationAgeDays} days`
                );

                if (organizationAgeDays < INACTIVE_DAYS) {
                    continue;
                }

                reason = "NO_USERS";
                inactiveDays = organizationAgeDays;
            }

            // ==================================================
            // CASE 2: ORGANIZATION HAS USERS
            // ==================================================

            else {
                const latestActivity = getLatestActivity(
                    users,
                    org
                );

                if (!latestActivity) {
                    inactiveDays = organizationAgeDays;
                } else {
                    inactiveDays = Math.max(
                        0,
                        Math.floor(
                            (now - latestActivity) / DAY_MS
                        )
                    );
                }

                console.log(
                    `${organizationName} inactive for ${inactiveDays} days`
                );

                if (inactiveDays < INACTIVE_DAYS) {
                    // Restore organizations that became active again
                    if (org.status === "pending_deletion") {
                        console.log(
                            `${organizationName} became active again. Restoring.`
                        );

                        await updateCleanupFields(
                            organizationId,
                            {
                                $set: {
                                    status: "active"
                                },
                                $unset: {
                                    warningEmailSentAt: "",
                                    scheduledDeletionAt: "",
                                    cleanupReason: "",
                                    finalReminderSentAt: ""
                                }
                            }
                        );
                    }

                    continue;
                }

                reason = "INACTIVE_ADMIN";
            }

            // ==================================================
            // NO ADMIN/CREATOR EMAIL
            // ==================================================

            if (
                !admin ||
                typeof admin.email !== "string" ||
                !admin.email.trim()
            ) {
                console.warn(
                    `${organizationName} has no valid admin email.`
                );

                /*
                 * Do not send an email, but still allow the cleanup
                 * lifecycle to proceed. The organization will be
                 * deleted after the grace period.
                 */
            }

            // ==================================================
            // FIRST WARNING
            // ==================================================

            const warningAlreadySent =
                getValidDate(org.warningEmailSentAt);

            if (!warningAlreadySent) {
                const scheduledDeletionAt = new Date(
                    now.getTime() + GRACE_DAYS * DAY_MS
                );

                const warningHtml =
                    reason === "NO_USERS"
                        ? `
                            <h2>Organization Scheduled For Removal</h2>

                            <p>
                                Your organization
                                <strong>${organizationName}</strong>
                                currently has no users.
                            </p>

                            <p>
                                If no one joins or logs in within the next
                                <strong>${GRACE_DAYS} days</strong>,
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
                                <strong>${organizationName}</strong>
                                has been inactive for
                                <strong>${inactiveDays} days</strong>.
                            </p>

                            <p>
                                If nobody logs in within the next
                                <strong>${GRACE_DAYS} days</strong>,
                                your organization and all associated data
                                will be permanently removed.
                            </p>

                            <p>
                                Simply logging in will cancel the deletion.
                            </p>
                        `;

                if (admin && admin.email) {
                    try {
                        await sendBrevoEmail(
                            admin.email,
                            "⚠ Organization Scheduled For Removal",
                            warningHtml
                        );

                        console.log(
                            `Warning email sent to ${admin.email}`
                        );
                    } catch (emailError) {
                        console.error(
                            `Warning email failed for ${organizationName}:`,
                            emailError
                        );

                        /*
                         * Do not mark warningEmailSentAt if the email
                         * failed. The next job run can retry it.
                         */
                        continue;
                    }
                } else {
                    console.warn(
                        `No admin email available for ${organizationName}.`
                    );
                }

                await updateCleanupFields(
                    organizationId,
                    {
                        $set: {
                            status: "pending_deletion",
                            warningEmailSentAt: now,
                            scheduledDeletionAt,
                            cleanupReason: reason
                        },
                        $unset: {
                            finalReminderSentAt: ""
                        }
                    }
                );

                console.log(
                    `${organizationName} scheduled for deletion on ${scheduledDeletionAt.toISOString()}`
                );

                continue;
            }

            // ==================================================
            // NORMALIZE/VALIDATE SCHEDULED DELETION DATE
            // ==================================================

            const scheduledDeletionAt = getValidDate(
                org.scheduledDeletionAt
            );

            if (!scheduledDeletionAt) {
                const repairedDeletionDate = new Date(
                    now.getTime() + GRACE_DAYS * DAY_MS
                );

                console.warn(
                    `${organizationName} has an invalid deletion date. Repairing it.`
                );

                await updateCleanupFields(
                    organizationId,
                    {
                        $set: {
                            status: "pending_deletion",
                            scheduledDeletionAt:
                                repairedDeletionDate,
                            cleanupReason:
                                org.cleanupReason || reason
                        }
                    }
                );

                continue;
            }

            // ==================================================
            // FINAL REMINDER
            // ==================================================

            const finalReminderAlreadySent =
                getValidDate(org.finalReminderSentAt);

            const finalReminderTime = new Date(
                scheduledDeletionAt.getTime() -
                FINAL_REMINDER_HOURS * 60 * 60 * 1000
            );

            if (
                !finalReminderAlreadySent &&
                now >= finalReminderTime &&
                now < scheduledDeletionAt
            ) {
                if (admin && admin.email) {
                    try {
                        await sendBrevoEmail(
                            admin.email,
                            "⏳ Final Reminder - Organization Deletion",
                            `
                                <h2>Final Reminder</h2>

                                <p>
                                    Your organization
                                    <strong>${organizationName}</strong>
                                    will be deleted in approximately
                                    <strong>24 hours</strong>.
                                </p>

                                <p>
                                    Simply logging into your account
                                    will immediately cancel the deletion.
                                </p>
                            `
                        );

                        console.log(
                            `Final reminder sent to ${admin.email}`
                        );
                    } catch (emailError) {
                        console.error(
                            `Final reminder failed for ${organizationName}:`,
                            emailError
                        );

                        continue;
                    }
                }

                await updateCleanupFields(
                    organizationId,
                    {
                        $set: {
                            finalReminderSentAt: now
                        }
                    }
                );
            }

            // ==================================================
            // DELETE ORGANIZATION
            // ==================================================

            if (now >= scheduledDeletionAt) {
                console.log(
                    `${organizationName} is ready for deletion.`
                );

                await deleteOrganizationCompletely(
                    organizationId
                );

                console.log(
                    `${organizationName} deleted successfully.`
                );
            }
        } catch (organizationError) {
            /*
             * Important:
             * An invalid organization must not stop the entire
             * cleanup process.
             */
            console.error(
                `Cleanup failed for organization ${organizationId} (${organizationName}):`,
                organizationError
            );

            continue;
        }
    }

    console.log("Inactive organization cleanup completed.");
};

module.exports = cleanupInactiveOrganizations;