const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserOrders,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.get("/orders", auth, getUserOrders);

// Admin only routes
router.get("/all", adminAuth, getAllUsers);
router.put("/:id/role", adminAuth, updateUserRole);
router.patch("/:id/toggle-status", adminAuth, toggleUserStatus);

module.exports = router;
