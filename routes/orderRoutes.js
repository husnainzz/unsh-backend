const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} = require("../controllers/orderController");

// Admin routes - must come before parameterized routes
router.get("/", adminAuth, getAllOrders);

// User routes
router.post("/", auth, createOrder);

// Parameterized routes must come last
router.get("/:id", auth, getOrderById);
router.put("/:id/cancel", auth, cancelOrder);
router.put("/:id/status", adminAuth, updateOrderStatus);

module.exports = router;
