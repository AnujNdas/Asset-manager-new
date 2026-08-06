const mongoose = require("mongoose");

const Organization = require("../models/Organization");
const User = require("../models/User");
const Employee = require("../models/Employee");

const Asset = require("../models/Asset");
const SoftwareAsset = require("../models/SoftwareAsset");
const AssetInstance = require("../models/AssetInstance");
const AssetAssignment = require("../models/AssetAssignment");

const Category = require("../models/Category");
const Location = require("../models/Location");
const Unit = require("../models/Unit");
const Department = require("../models/Department");

const ActivityLog = require("../models/ActivityLog");
const SupportTicket = require("../models/SupportTicket");
const Subscription = require("../models/Subscription");
const OrganizationInvite = require("../models/OrganizationInvite");

const deleteOrganizationCompletely = async (organizationId) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        console.log(
            `Deleting organization ${organizationId}`
        );

        //--------------------------------------------------
        // USERS
        //--------------------------------------------------

        await User.deleteMany(
            { organizationId },
            { session }
        );

        await Employee.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // ASSETS
        //--------------------------------------------------

        await AssetAssignment.deleteMany(
            { organizationId },
            { session }
        );

        await AssetInstance.deleteMany(
            { organizationId },
            { session }
        );

        await Asset.deleteMany(
            { organizationId },
            { session }
        );

        await SoftwareAsset.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // MASTER DATA
        //--------------------------------------------------

        await Category.deleteMany(
            { organizationId },
            { session }
        );

        await Department.deleteMany(
            { organizationId },
            { session }
        );

        await Location.deleteMany(
            { organizationId },
            { session }
        );

        await Unit.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // LOGS
        //--------------------------------------------------

        await ActivityLog.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // SUPPORT
        //--------------------------------------------------

        await SupportTicket.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // INVITES
        //--------------------------------------------------

        await OrganizationInvite.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // SUBSCRIPTION
        //--------------------------------------------------

        await Subscription.deleteMany(
            { organizationId },
            { session }
        );

        //--------------------------------------------------
        // ORGANIZATION
        //--------------------------------------------------

        await Organization.deleteOne(
            { _id: organizationId },
            { session }
        );

        await session.commitTransaction();

        console.log(
            `Organization ${organizationId} deleted successfully`
        );

        return true;

    }

    catch (err) {

        await session.abortTransaction();

        console.error(
            "Organization cleanup failed:",
            err
        );

        throw err;

    }

    finally {

        session.endSession();

    }

};

module.exports = deleteOrganizationCompletely;