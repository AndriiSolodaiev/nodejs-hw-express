const express = require("express");
const AuthController = require("../../controllers/auth");
const router = express.Router();
const { authenticate, upload } = require("../../midleware");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/current", authenticate, AuthController.getCurrent);
router.post("/logout", authenticate, AuthController.logout);
router.patch("/", authenticate, AuthController.patchSubscr);
router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  AuthController.patchAvatar
);
module.exports = router;
