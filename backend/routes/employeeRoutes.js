const express = require("express");
const router = express.Router();

const { createEmployee, getEmployees } = require("../controllers/employeeController");

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

module.exports = router;