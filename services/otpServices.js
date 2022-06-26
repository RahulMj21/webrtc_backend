const crypto = require("crypto");
const hashServices = require("./hasServices");

class OtpServices {
  generateOtp() {
    return crypto.randomInt(1000, 9999);
  }

  async sendOtpBySms(phone, otp) {
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;
    const twilio = require("twilio")(accountSid, authToken);

    await twilio.messages.create({
      to: phone,
      from: process.env.FROM,
      body: `Your Codershouse otp is ${otp}`,
    });
  }

  validateOtp(actualHash, data) {
    const hashedData = hashServices.generateHash(data);
    return actualHash.toString() === hashedData.toString();
  }
}

module.exports = new OtpServices();
