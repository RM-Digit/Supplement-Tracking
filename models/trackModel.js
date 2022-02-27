const mongoose = require("../services/mongoose").mongoose;

const Schema = mongoose.Schema;

const CustomerModel = new Schema(
  {
    customer_id: {
      type: String,
      unique: true,
    },
    customer_email: {
      type: String,
    },
    customer_name: {
      type: String,
    },
    history: {
      type: Object,
    },
    track: {
      type: Number,
      default: 0,
    },
  },
  { strict: true },
  {
    collection: "customers2",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("customers2", CustomerModel);
