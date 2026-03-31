const Location = require("../models/Location");
const Category = require("../models/Category");
const Department = require("../models/Department");
const Status = require("../models/Status");
const Unit = require("../models/Unit");
const {
  defaultLocations,
  defaultCategories,
  defaultDepartments,
  defaultStatuses,
  defaultUnits,
} = require("../utils/default.js");
const insertDefaults = async (Model, values, organizationId, session) => {
  for (const item of values) {
    const exists = await Model.findOne({
      name: item.name,
      organizationId,
      isSystem: true,
    }).session(session);

    if (!exists) {
      await Model.create(
        [
          {
            ...item, // 🔥 includes categoryType if present
            organizationId,
            isSystem: true,
            isActive: true,
          },
        ],
        { session }
      );
    }
  }
};

const seedOrganizationDefaults = async (organizationId, session) => {
  await insertDefaults(Location, defaultLocations, organizationId, session);
  await insertDefaults(Category, defaultCategories, organizationId, session);
  await insertDefaults(Department, defaultDepartments, organizationId, session);
  await insertDefaults(Status, defaultStatuses, organizationId, session);
  await insertDefaults(Unit, defaultUnits, organizationId, session);
};

module.exports = seedOrganizationDefaults;