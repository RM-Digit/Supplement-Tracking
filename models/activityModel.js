const { stringify } = require("uuid");

const mongoose = require("../services/mongoose").mongoose;

const Schema = mongoose.Schema;

const ActivityModel = new Schema(
  {
    customer_id: {
      type: String,
    },
    order_id: {
      type: String,
    },
    customer_name: {
      type: String,
    },
    edit_date: {
      type: Date,
    },
    addedVariants: {
      type: Array,
    },
    note: {
      type: String,
    },
    order_origin: {
      type: String,
    },
  },
  { strict: true },
  {
    collection: "activities2",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("activities2", ActivityModel);
