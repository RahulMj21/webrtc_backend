const jwt = require("jsonwebtoken");
const tokenModel = require("../models/tokenModel");

class TokenServices {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.ACCESSTOKEN_SECRET, {
      expiresIn: "60s",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESHTOKEN_SECRET, {
      expiresIn: "1y",
    });

    return { accessToken, refreshToken };
  }
  whitelistRefreshToken(payload) {
    return tokenModel.create(payload);
  }
  verifyAccessToken(token) {
    const accessToken = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
    return accessToken;
  }
  verifyRefreshToken(token) {
    const refreshToken = jwt.verify(token, process.env.REFRESHTOKEN_SECRET);
    return refreshToken;
  }
  findToken(refresh_token, userId) {
    return tokenModel.findOne({ refresh_token, userId });
  }
  findTokenByUserId(userId) {
    return tokenModel.findOne({ userId });
  }
  updateToken(userId, payload) {
    return tokenModel.findOneAndUpdate({ userId }, payload, { new: true });
  }
  deleteToken(filter) {
    return tokenModel.deleteOne(filter);
  }
}
module.exports = new TokenServices();
