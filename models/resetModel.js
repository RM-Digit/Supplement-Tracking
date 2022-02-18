const mongoose = require("../services/mongoose").mongoose;

const Schema = mongoose.Schema;

const ResetModel = new Schema(
  {
    customer_id: {
      type: String,
      unique: true,
    },
    change: {
      type: Number,
      default: 0,
    },
  },
  { strict: true },
  {
    collection: "reset2",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("reset2", ResetModel);
