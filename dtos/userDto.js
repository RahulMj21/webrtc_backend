class UserDto {
  id;
  phone;
  email;
  createdAt;
  activated;
  userName;
  userAvatar;

  constructor(data) {
    this.id = data._id;
    this.phone = data.phone;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.activated = data.activated;
    this.userName = data.userName ? data.userName : "";
    this.userAvatar = data.userAvatar ? data.userAvatar : "";
  }
}

module.exports = UserDto;
