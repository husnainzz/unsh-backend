const express = require("express");
const router = express.Router();
const { auth, adminAuth, coordinatorAuth } = require("../middleware/auth");
const {
  createOrder,
  createGuestOrder,
  getOrderById,
  getOrderByTrackingId,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  cancelOrder,
  getUserOrders,
} = require("../controllers/orderController");

// Public routes - must come before parameterized routes
router.get("/track/:trackingId", getOrderByTrackingId); // Public order tracking
router.post("/guest", createGuestOrder); // Public guest order creation

// Admin routes - must come before parameterized routes
router.get("/", adminAuth, getAllOrders);
router.get("/user/orders", auth, getUserOrders); // Get current user's orders

// User routes
router.post("/", auth, createOrder);

// Parameterized routes must come last
router.get("/:id", auth, getOrderById);
router.put("/:id/cancel", auth, cancelOrder);
router.put("/:id/status", coordinatorAuth, updateOrderStatus); // Coordinator or admin can update status
router.put("/:id/payment", adminAuth, updatePaymentStatus); // Only admin can update payment status

module.exports = router;
