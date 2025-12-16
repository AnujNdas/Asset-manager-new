const Category = require("../models/Category");

/* ================= CREATE CATEGORY ================= */
const createCategory = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    name = name.trim();

    // Check if inactive category exists → revive instead of duplicate
    const existing = await Category.findOne({
      name,
      isActive: false
    });

    if (existing) {
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({
        message: "Category restored successfully",
        category: existing
      });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Category already exists"
      });
    }

    console.error("Error creating category:", error);
    res.status(500).json({ error: "Error creating category" });
  }
};

/* ================= GET ACTIVE CATEGORIES ================= */
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Error fetching categories" });
  }
};

/* ================= UPDATE CATEGORY ================= */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    name = name.trim();

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, isActive: true },
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Category with this name already exists"
      });
    }

    console.error("Error updating category:", error);
    res.status(500).json({ error: "Error updating category" });
  }
};

/* ================= SOFT DELETE CATEGORY ================= */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      category
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Error deleting category" });
  }
};

/* ================= RESTORE CATEGORY ================= */
const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndUpdate(
      { _id: id, isActive: false },
      { isActive: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found or already active" });
    }

    res.status(200).json({
      message: "Category restored successfully",
      category
    });
  } catch (error) {
    console.error("Error restoring category:", error);
    res.status(500).json({ error: "Error restoring category" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  restoreCategory
};
