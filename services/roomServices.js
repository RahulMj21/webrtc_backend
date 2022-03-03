const RoomsDto = require("../dtos/roomsDto");
const roomsModel = require("../models/roomsModel");

class RoomServices {
  async create({ roomType, roomName, ownerId }) {
    const room = await roomsModel.create({
      roomType,
      roomName,
      ownerId,
      speakers: [ownerId],
    });
    return new RoomsDto(room);
  }
  async rooms(types) {
    try {
      const rooms = await roomsModel
        .find({ roomType: { $in: types } })
        .populate("ownerId")
        .populate("speakers")
        .exec();
      const newRooms = rooms.map((room) => new RoomsDto(room));
      return newRooms;
    } catch (error) {
      console.log(error);
    }
  }
  async singleRoom(id) {
    try {
      const room = await roomsModel
        .findById(id)
        .populate("ownerId")
        .populate("speakers")
        .exec();

      return room;
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = new RoomServices();
