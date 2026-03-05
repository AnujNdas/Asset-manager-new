const express = require("express");
const router = express.Router();

const { createEmployee, getEmployees , updateEmployee , deleteEmployee , getEmployeeAssetSummary } = require("../controllers/employeeController");

const authentication = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

/* ----------------------------------
   GLOBAL PROTECTION FOR THIS ROUTER
----------------------------------- */
router.use(
  authentication(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);

router.post("/", createEmployee);
router.get("/", getEmployees);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);
router.get("/summary", getEmployeeAssetSummary);
module.exports = router;