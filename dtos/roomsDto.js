class RoomsDto {
  _id;
  roomName;
  roomType;
  ownerId;
  speakers;
  createdAt;

  constructor(room) {
    this._id = room._id;
    this.roomName = room.roomName;
    this.roomType = room.roomType;
    this.ownerId = room.ownerId;
    this.speakers = room.speakers;
    this.createdAt = room.createdAt;
  }
}

module.exports = RoomsDto;
