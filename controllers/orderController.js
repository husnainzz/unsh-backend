const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create new order (authenticated user)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log("Order creation request body:", req.body);
    console.log("Authenticated user data:", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      hasPhoneNumber: !!req.user.phoneNumber,
    });
    const { items, shippingAddress, paymentDetails } = req.body;

    if (!items || items.length === 0) {
      console.log("No items found in request");
      return res.status(400).json({ error: "No order items" });
    }

    // Validate products and check stock
    let totalAmount = 0;
    for (let item of items) {
      const product = await Product.findOne({ prodId: item.prodId });
      if (!product || !product.isActive) {
        return res
          .status(400)
          .json({ error: `Product ${item.prodId} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }

      totalAmount += item.price * item.quantity;
    }

    // Add guest info from authenticated user
    if (!req.user.phoneNumber) {
      return res.status(400).json({
        error:
          "User phone number is required. Please update your profile with a phone number.",
      });
    }

    const guestInfo = {
      name: req.user.name,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
    };

    const order = await Order.create({
      user: req.user._id,
      guestInfo,
      items,
      totalAmount,
      shippingAddress,
      paymentDetails,
    });

    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email"
    );

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new guest order (no authentication required)
// @route   POST /api/orders/guest
// @access  Public
const createGuestOrder = async (req, res) => {
  try {
    console.log("Guest order creation request body:", req.body);
    console.log(
      "Product model enum values:",
      Product.schema.paths.category.enumValues
    );
    const { items, shippingAddress, paymentDetails, guestInfo } = req.body;

    if (!items || items.length === 0) {
      console.log("No items found in request");
      return res.status(400).json({ error: "No order items" });
    }

    if (
      !guestInfo ||
      !guestInfo.name ||
      !guestInfo.email ||
      !guestInfo.phoneNumber
    ) {
      return res.status(400).json({
        error: "Guest information (name, email, phoneNumber) is required",
      });
    }

    // Validate products and check stock
    let totalAmount = 0;
    for (let item of items) {
      console.log("Looking up product with prodId:", item.prodId);
      const product = await Product.findOne({ prodId: item.prodId });
      console.log(
        "Found product:",
        product
          ? {
              name: product.name,
              category: product.category,
              stock: product.stock,
            }
          : "Not found"
      );

      if (!product || !product.isActive) {
        return res
          .status(400)
          .json({ error: `Product ${item.prodId} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Insufficient stock for ${product.name}` });
      }

      totalAmount += item.price * item.quantity;
    }

    console.log("About to create order with data:", {
      guestInfo,
      items,
      totalAmount,
      shippingAddress,
      paymentDetails,
    });

    try {
      const order = await Order.create({
        guestInfo,
        items,
        totalAmount,
        shippingAddress,
        paymentDetails,
      });
      console.log("Order created successfully:", order._id);
      res.status(201).json(order);
    } catch (orderError) {
      console.error("Error creating order:", orderError);
      console.error("Order error details:", {
        name: orderError.name,
        message: orderError.message,
        code: orderError.code,
        errors: orderError.errors,
      });
      throw orderError;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get order by tracking ID
// @route   GET /api/orders/track/:trackingId
// @access  Public
const getOrderByTrackingId = async (req, res) => {
  try {
    const order = await Order.findOne({
      trackingId: req.params.trackingId,
    }).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status (admin/coordinator only)
// @route   PUT /api/orders/:id/status
// @access  Private/Coordinator
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status || order.status;

    const updatedOrder = await order.save();

    const populatedOrder = await Order.findById(updatedOrder._id).populate(
      "user",
      "name email"
    );

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update payment status (admin only)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, screenshot } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (paymentStatus) {
      order.paymentDetails.status = paymentStatus;
    }
    if (screenshot) {
      order.paymentDetails.screenshot = screenshot;
    }

    const updatedOrder = await order.save();

    const populatedOrder = await Order.findById(updatedOrder._id).populate(
      "user",
      "name email"
    );

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      orderType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter["paymentDetails.status"] = paymentStatus;
    if (orderType) filter.orderType = orderType;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (
      order.user &&
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Only allow cancellation of pending orders
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Cannot cancel order in current status" });
    }

    order.status = "cancelled";
    await order.save();

    // Restore product stock
    for (let item of order.items) {
      const product = await Product.findOne({ prodId: item.prodId });
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/user/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  createGuestOrder,
  getOrderById,
  getOrderByTrackingId,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  cancelOrder,
  getUserOrders,
};
