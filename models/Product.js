const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    prodId: {
      type: String,
      unique: true,
      // Remove required: true since it's auto-generated
    },
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
      enum: ["women", "girl", "boy"],
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
    colors: [String],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        featured: {
          type: Boolean,
          default: false,
        },
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
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate prodId
productSchema.pre("save", function (next) {
  if (!this.prodId) {
    const timestamp = Date.now();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.prodId = `PRO-${timestamp}-${randomDigits}`;
  }
  next();
});

// Ensure only one featured image per product
productSchema.pre("save", function (next) {
  if (this.images && this.images.length > 0) {
    let featuredCount = 0;
    this.images.forEach((image) => {
      if (image.featured) featuredCount++;
    });

    if (featuredCount > 1) {
      // Reset all to false and set first one as featured
      this.images.forEach((image, index) => {
        image.featured = index === 0;
      });
    } else if (featuredCount === 0 && this.images.length > 0) {
      // Set first image as featured if none is featured
      this.images[0].featured = true;
    }
  }
  next();
});

// Index for search functionality
productSchema.index({
  name: "text",
  description: "text",
});

module.exports = mongoose.model("Product", productSchema);
