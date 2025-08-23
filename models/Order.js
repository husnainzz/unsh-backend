const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  prodId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  size: String,
  color: String,
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      // Remove required: true since it's auto-generated
    },
    // User field is optional for guest orders
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional for guest orders
    },
    // Guest order fields
    guestInfo: {
      name: {
        type: String,
        required: function () {
          return !this.user;
        }, // Required if no user
        trim: true,
      },
      email: {
        type: String,
        required: true, // Always required for both guest and auth users
        trim: true,
        lowercase: true,
      },
      phoneNumber: {
        type: String,
        required: true, // Always required for both guest and auth users
        trim: true,
      },
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["cod", "bank", "card"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
      screenshot: {
        type: String,
        default: null,
      },
    },
    // Order type to distinguish between guest and authenticated
    orderType: {
      type: String,
      enum: ["guest", "authenticated"],
      default: "authenticated",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate trackingId and calculate totalAmount
orderSchema.pre("save", function (next) {
  // Generate trackingId if not present
  if (!this.trackingId) {
    const timestamp = Date.now();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.trackingId = `ORD-${timestamp}-${randomDigits}`;
  }

  // Set order type based on user field
  if (this.user) {
    this.orderType = "authenticated";
  } else {
    this.orderType = "guest";
  }

  // Calculate totalAmount from items
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
