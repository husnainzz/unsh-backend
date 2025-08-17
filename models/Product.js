const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["shirts", "pants", "dresses", "shoes", "accessories", "outerwear"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    sizes: [
      {
        type: String,
        enum: [
          "XS",
          "S",
          "M",
          "L",
          "XL",
          "XXL",
          "36",
          "38",
          "40",
          "42",
          "44",
          "46",
        ],
      },
    ],
    colors: [
      {
        name: String,
        hexCode: String,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  category: "text",
});

module.exports = mongoose.model("Product", productSchema);
