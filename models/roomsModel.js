const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roomsSchema = new Schema(
  {
    roomName: { type: String, required: true },
    roomType: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    speakers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const roomsModel = mongoose.model("Rooms", roomsSchema, "rooms");
module.exports = roomsModel;
