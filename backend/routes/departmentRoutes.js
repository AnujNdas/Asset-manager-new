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
router.get("/", authenticateToken(["admin", "user"]), getDepartments);
router.post("/", authenticateToken(["admin", "user"]), createDepartment);
router.put("/:id", authenticateToken(["admin", "user"]), updateDepartment);
router.delete("/:id", authenticateToken(["admin", "user"]), deleteDepartment);
router.patch("/:id/restore", authenticateToken(["admin", "user"]), restoreDepartment);
module.exports = router;
