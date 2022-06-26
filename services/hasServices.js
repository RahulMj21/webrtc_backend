const crypto = require("crypto");

class HasServices {
  generateHash(data) {
    return crypto
      .createHmac("sha256", process.env.SECURITY_KEY)
      .update(data)
      .digest("hex");
  }

  validateHash() {}
}

module.exports = new HasServices();
