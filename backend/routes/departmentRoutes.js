const express = require("express");
const router = express.Router();
const {
  createDepartment,
  updateDepartment,
  getDepartments,
  deleteDepartment
} = require("../controllers/departmentController");

router.get("/", getDepartments);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;
