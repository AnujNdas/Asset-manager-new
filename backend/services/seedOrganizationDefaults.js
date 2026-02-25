const Location = require("../models/Location");
const Category = require("../models/Category");
const Department = require("../models/Department");
const Status = require("../models/Status");
const Unit = require("../models/Unit");

const DEFAULT_LOCATIONS = [
  "Head Office",
  "Warehouse",
  "Remote",
  "Branch Office",
];

const DEFAULT_CATEGORIES = [
  "OS",
  "SaaS",
  "Server & Storage",
  "Desktop Applications",
  "Enterprise Systems",
  "Digital Accessories",
  "Machinery",
  "Robotics",
  "Equipment",
  "Tools",
  "Electronics",
  "Security & Safety",
  "User-End-Device",
];

const DEFAULT_DEPARTMENTS = [
  "Sales",
  "Research & Development",
  "Product Management",
  "Operations & Administration",
  "Marketing",
  "Logistics & Warehouse",
  "Information Technology",
  "Human Resources (HR)",
  "Finance & Accounting",
  "Customer Support",
];

const DEFAULT_STATUS = [
  "Active (In Use)",
  "In Stock",
  "In Repair",
  "Sold / Donated",
  "Disposed",
  "Missing / Stolen",
];

const DEFAULT_UNITS = [
  "User / Seat",
  "Device / Endpoint",
  "Piece",
  "Gigabytes (GB)",
  "Terabytes (TB)",
  "Cores / Sockets",
  "Concurrent User",
];

const insertDefaults = async (Model, values, organizationId, session) => {
  const exists = await Model.exists({
    organizationId,
    isSystem: true,
  });

  if (exists) return;

  const docs = values.map((name) => ({
    name,
    organizationId,
    isSystem: true,
    isActive: true,
  }));

  await Model.insertMany(docs, { session });
};

const seedOrganizationDefaults = async (organizationId, session) => {
  await insertDefaults(Location, DEFAULT_LOCATIONS, organizationId, session);
  await insertDefaults(Category, DEFAULT_CATEGORIES, organizationId, session);
  await insertDefaults(Department, DEFAULT_DEPARTMENTS, organizationId, session);
  await insertDefaults(Status, DEFAULT_STATUS, organizationId, session);
  await insertDefaults(Unit, DEFAULT_UNITS, organizationId, session);
};

module.exports = seedOrganizationDefaults;