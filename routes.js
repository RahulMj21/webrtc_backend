const router = require("express").Router();
const activateController = require("./controllers/activateController");
const authController = require("./controllers/authController");
const roomsController = require("./controllers/roomsController");
const checkAuth = require("./middlewares/checkAuth");

router.get("/", (_, res) => {
  res.status(200).send("<h1>Welcome to our webrtc project🚀🚀</h1>");
});

// Auth
router.post("/api/send-phone-otp", authController.sendPhoneOtp);
router.post("/api/send-email-otp", authController.sendEmailOtp);
router.post("/api/verify-otp", authController.verifyOtp);
router.post("/api/activate-user", checkAuth, activateController.activate);
router.get("/api/refresh", authController.refresh);
router.post("/api/logout", checkAuth, authController.logout);

// Rooms
router.post("/api/rooms", checkAuth, roomsController.create);
router.get("/api/rooms", checkAuth, roomsController.index);
router.get("/api/rooms/:id", checkAuth, roomsController.singleRoom);

module.exports = router;
