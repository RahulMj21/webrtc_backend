const tokenServices = require("../services/tokenServices");

const ckeckAuth = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new Error();
    }
    const userData = tokenServices.verifyAccessToken(accessToken);
    if (!userData) {
      throw new Error();
    }
    req.user = userData;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = ckeckAuth;
