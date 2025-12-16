const express = require("express");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  restoreCategory
} = require("../controllers/categoryControllers");

const router = express.Router();

/* ================= CREATE ================= */
router.post("/", createCategory);

/* ================= READ (ACTIVE ONLY) ================= */
router.get("/", getCategories);

/* ================= UPDATE ================= */
router.put("/:id", updateCategory);

/* ================= SOFT DELETE ================= */
router.delete("/:id", deleteCategory);

/* ================= RESTORE ================= */
router.patch("/:id/restore", restoreCategory);

module.exports = router;
