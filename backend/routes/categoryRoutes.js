const express = require("express");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  restoreCategory
} = require("../controllers/categoryControllers");
const authenticateToken = require("../Middleware/Authentication-token");
const router = express.Router();

/* ================= CREATE ================= */
router.post("/", authenticateToken(["admin", "super-admin"]), createCategory);
/* ================= READ (ACTIVE ONLY) ================= */
router.get("/", getCategories);

/* ================= UPDATE ================= */
router.put("/:id", authenticateToken(["admin", "super-admin"]), updateCategory);

/* ================= SOFT DELETE ================= */
router.delete("/:id", authenticateToken(["admin", "super-admin"]), deleteCategory);

/* ================= RESTORE ================= */
router.patch("/:id/restore", authenticateToken(["admin", "super-admin"]), restoreCategory);

module.exports = router;
