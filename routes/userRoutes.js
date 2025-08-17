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

module.exports = router;
