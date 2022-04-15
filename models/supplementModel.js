const mongoose = require("../services/mongoose").mongoose;

const Schema = mongoose.Schema;

const Supplements = new Schema(
  {
    product_id: {
      type: String,
      unique: true,
    },
    product_GID: {
      type: String,
    },
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    quantity: {
      type: Number,
    },
  },
  { strict: true },
  {
    collection: "supplements2",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("supplements2", Supplements);
