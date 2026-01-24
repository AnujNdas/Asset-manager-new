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
router.post("/", authenticateToken(["admin", "user"]), createCategory);
/* ================= READ (ACTIVE ONLY) ================= */
router.get("/", authenticateToken(["admin", "user"]), getCategories);

/* ================= UPDATE ================= */
router.put("/:id", authenticateToken(["admin", "user"]), updateCategory);

/* ================= SOFT DELETE ================= */
router.delete("/:id", authenticateToken(["admin", "user"]), deleteCategory);

/* ================= RESTORE ================= */
router.patch("/:id/restore", authenticateToken(["admin", "user"]), restoreCategory);

module.exports = router;
