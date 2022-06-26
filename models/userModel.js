const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    phone: { type: String },
    email: { type: String },
    activated: { type: Boolean, default: false },
    userName: { type: String },
    userAvatar: {
      type: String,
      get: (userAvatar) => {
        if (userAvatar) {
          return `${process.env.BASE_URL}/${userAvatar}`;
        }
        return userAvatar;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    id: false,
  }
);

userModel = mongoose.model("User", userSchema, "users");

module.exports = userModel;
