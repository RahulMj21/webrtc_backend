const roomServices = require("../services/roomServices");

class RoomsController {
  async create(req, res) {
    try {
      const { roomType, roomName } = req.body;
      if (!roomType || !roomName) {
        return res.status(400).json({ message: "Missing Credentials" });
      }
      const payload = { roomType, roomName, ownerId: req.user._id };
      const room = await roomServices.create(payload);
      return res.status(200).json(room);
    } catch (error) {
      res.status(500).json({ message: "internal server error.." });
    }
  }
  async index(req, res) {
    try {
      const rooms = await roomServices.rooms(["Open"]);
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  }
  async singleRoom(req, res) {
    try {
      const { id } = req.params;
      const room = await roomServices.singleRoom(id);
      res.status(200).json({ success: true, room });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
      console.log(error);
    }
  }
}
module.exports = new RoomsController();
