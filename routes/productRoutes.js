const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  toggleProductStatus,
  getAllProducts,
} = require("../controllers/productController");

// Public routes - specific routes must come before parameterized routes
router.get("/", getProducts);
router.get("/all", adminAuth, getAllProducts); // Admin only - gets all products including inactive
router.get("/categories", getCategories);
router.get("/brands", getBrands);

// Admin only routes
router.post("/", adminAuth, createProduct);

// Parameterized routes must come last
router.get("/:id", getProductById);
router.put("/:id", adminAuth, updateProduct);
router.delete("/:id", adminAuth, deleteProduct);
router.patch("/:id/toggle-status", adminAuth, toggleProductStatus);

module.exports = router;
