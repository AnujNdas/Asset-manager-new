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
router.get("/", getDepartments);
router.post("/", authenticateToken(["admin", "super-admin"]), createDepartment);
router.put("/:id", authenticateToken(["admin", "super-admin"]), updateDepartment);
router.delete("/:id", authenticateToken(["admin", "super-admin"]), deleteDepartment);
router.patch("/:id/restore", authenticateToken(["admin", "super-admin"]), restoreDepartment);
module.exports = router;
