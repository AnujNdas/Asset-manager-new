const express = require("express");
const router = express.Router();

const {
  createDepartment,
  updateDepartment,
  getDepartments,
  deleteDepartment,
  restoreDepartment
} = require("../controllers/departmentController");

const authenticateToken = require("../Middleware/Authentication-token");
const tenantMiddleware = require("../Middleware/tenantMiddleware");
const requireActiveSubscription = require("../Middleware/requireActiveSubscription");

/* ----------------------------------
   GLOBAL PROTECTION FOR THIS ROUTER
----------------------------------- */
router.use(
  authenticateToken(["admin", "user"]),
  tenantMiddleware,
  requireActiveSubscription
);

router.get("/", getDepartments);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);
router.patch("/:id/restore", restoreDepartment);

module.exports = router;