const mongoose = require("../services/mongoose").mongoose;

const Schema = mongoose.Schema;

const ProductModel = new Schema(
  {
    product_id: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    totalInventory: {
      type: String,
    },
    tags: {
      type: String,
    },
    track: {
      type: Number,
      default: 0,
    },
  },
  { strict: true },
  {
    collection: "products2",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("products2", ProductModel);
