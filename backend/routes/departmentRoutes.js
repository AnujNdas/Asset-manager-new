const express = require("express");
const router = express.Router();
const {
  createDepartment,
  updateDepartment,
  getDepartments,
  deleteDepartment,
  restoreDepartment
} = require("../controllers/departmentController");

router.get("/", getDepartments);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);
router.patch("/:id/restore", restoreDepartment);

module.exports = router;
