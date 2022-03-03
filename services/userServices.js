const UserModel = require("../models/dbmodel");
class UserServices {
  findUser(filter) {
    return UserModel.findOne(filter);
  }

  createUser(data) {
    return UserModel.create(data);
  }
  updateUser(filter, data) {
    return UserModel.findOneAndUpdate(filter, data, { new: true });
  }
}

module.exports = new UserServices();
