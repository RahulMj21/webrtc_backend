const otpServices = require("../services/otpServices");
const hasServices = require("../services/hasServices");
const UserServices = require("../services/userServices");
const TokenServices = require("../services/tokenServices");
const mailService = require("../services/mailService");
const UserDto = require("../dtos/userDto");

class AuthController {
  async sendPhoneOtp(req, res) {
    const phone = req.body.phone;
    const otp = otpServices.generateOtp();
    const ttl = 1000 * 60 * 2;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = hasServices.generateHash(data);

    if (!phone) {
      return res.status(400).json({ message: "You have to enter phone no." });
    }

    // send otp
    try {
      // await otpServices.sendOtpBySms(phone, otp);
      res.json({
        hash: `${hash}.${expires}`,
        phone,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "message sending failed", err });
    }
  }
  async sendEmailOtp(req, res) {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: "please provide an valid email" });
    }
    const otp = otpServices.generateOtp();
    const ttl = 1000 * 60 * 20;
    const expires = Date.now() + ttl;
    const data = `${email}.${otp}.${expires}`;
    const hash = hasServices.generateHash(data);
    // send otp
    try {
      const input = {
        to: email,
        subject: "email confirmation with OTP from webrtc",
        html: `<p>OTP is : ${otp}</p>`,
      };
      const info = await mailService.sendMail(input);
      if (!info) return res.status(500).json("Oops.. something went wrong");
      res.status(200).json({
        success: true,
        message: "an otp has been sent to your email",
        data: {
          hash: `${hash}.${expires}`,
          email,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "message sending failed", err });
    }
  }
  async verifyOtp(req, res) {
    const { otp, hash } = req.body;
    const email = req.body.email ? req.body.email : null;
    const phone = req.body.phone ? req.body.phone : null;
    if ((!email && !phone) || !hash)
      return res.status(500).json({ message: "Oops..something went wrong" });

    if (!otp) return res.status(409).json({ message: "otp is required" });

    const [actualHash, expires] = hash.split(".");

    if (Date.now() > expires) {
      return res.status(400).json({ message: "OTP has been expired..." });
    }
    const userPreference = phone ? phone : email;

    const data = `${userPreference}.${otp}.${expires}`;

    const isvalid = otpServices.validateOtp(actualHash, data);

    if (!isvalid) {
      return res.status(400).json({ message: "OTP mismatched..." });
    }

    // find or create user
    let user;
    try {
      let input;
      phone ? (input = { phone }) : (input = { email });

      user = await UserServices.findUser(input);
      if (!user) {
        user = await UserServices.createUser(input);
      }
      // generate cookies
      const { accessToken, refreshToken } = TokenServices.generateTokens({
        _id: user._id,
      });
      // set cookies
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 365,
        httpOnly: true,
      });
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 365,
        httpOnly: true,
      });

      //find if any userId is there in the db and if the user exists then just update the token
      const token = await TokenServices.findTokenByUserId(user._id);
      if (!token) {
        // whitelist the refresh token
        await TokenServices.whitelistRefreshToken({
          refresh_token: refreshToken,
          userId: user._id,
        });
      } else {
        //update Token
        await TokenServices.updateToken(user._id, {
          refresh_token: refreshToken,
          userId: user._id,
        });
      }

      // DTO - [Data Transfer Object] : by this we remove all the unnecessery fields from data
      const userDto = new UserDto(user);

      //send response
      res.json({ accessToken, user: userDto });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
  async refresh(req, res) {
    //get the token from request
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // verify the token
    let userData;
    try {
      userData = await TokenServices.verifyRefreshToken(refreshTokenFromCookie);

      if (!userData) {
        return res.status(401).json({ message: "Invalid Token" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
    //check if the token exists in the db
    let token;
    try {
      token = await TokenServices.findToken(
        refreshTokenFromCookie,
        userData._id
      );

      if (!token) {
        return res.status(401).json({ message: "Invalid Token" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }

    // check if the user exists in the db
    let user;
    try {
      user = await UserServices.findUser({ _id: token.userId });
      if (!user) {
        return res.status(400).json({ message: "" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }

    // generate new tokens
    try {
      const { accessToken, refreshToken } = TokenServices.generateTokens({
        _id: user._id,
      });
      //update token in the db
      await TokenServices.updateToken(user._id, {
        refresh_token: refreshToken,
        userId: user._id,
      });
      // send the cookies to the browser
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 365,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 365,
        httpOnly: true,
      });

      const userDto = new UserDto(user);
      res.status(200).json({ user: userDto, auth: true });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;
      const token = await TokenServices.deleteToken({
        refresh_token: refreshToken,
      });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json({ user: null });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
module.exports = new AuthController();
