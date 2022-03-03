const UserServices = require("../services/userServices");
const path = require("path");
const fs = require("fs");
const UserDto = require("../dtos/userDto");

class ActivateController {
  async activate(req, res, next) {
    const user = req.user;
    if (!user) {
      return res.status(500).json({ message: "user not found" });
    }
    const data = req.body;
    if (!data) {
      return res.status(401).json({ message: "all fields are required" });
    }
    let localPath;
    try {
      const ext = path.extname(data.fileName);
      localPath = `uploads/${Date.now()}${ext}`;
      const filePath = `${appRoot}/${localPath}`;
      const buffer = Buffer.from(data.userAvatar.split(",")[1], "base64");
      fs.writeFileSync(filePath, buffer);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      const updatedData = {
        userName: data.userName,
        userAvatar: localPath,
        activated: true,
      };
      const updatedUser = await UserServices.updateUser(
        { _id: user._id },
        updatedData
      );
      const userDto = await new UserDto(updatedUser);
      res.status(200).json({ user: userDto });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  }
}

module.exports = new ActivateController();
