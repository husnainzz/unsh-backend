const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  getProducts,
  getProductById,
  getProductByProdId,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  toggleProductStatus,
  getAllProducts,
} = require("../controllers/productController");

// Public routes - specific routes must come before parameterized routes
router.get("/", getProducts);
router.get("/all", adminAuth, getAllProducts); // Admin only - gets all products including inactive
router.get("/categories", getCategories);
router.get("/prod/:prodId", getProductByProdId); // Get product by prodId

// Admin only routes
router.post("/", adminAuth, createProduct);

// Parameterized routes must come last
router.get("/:prodId", getProductById); // Get product by prodId (alias)
router.put("/:prodId", adminAuth, updateProduct);
router.delete("/:prodId", adminAuth, deleteProduct);
router.patch("/:prodId/toggle-status", adminAuth, toggleProductStatus);

module.exports = router;
