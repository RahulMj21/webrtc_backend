const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema(
  {
    refresh_token: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: false }
);
module.exports = mongoose.model("RefreshToken", tokenSchema, "tokens");
