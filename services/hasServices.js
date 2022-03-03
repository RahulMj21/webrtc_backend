const crypto = require("crypto");

class HasServices {
  generateHash(data) {
    return crypto
      .createHmac("sha256", process.env.security_key)
      .update(data)
      .digest("hex");
  }

  validateHash() {}
}

module.exports = new HasServices();
