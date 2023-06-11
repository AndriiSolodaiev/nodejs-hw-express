const bcrypt = require("bcrypt");
const { HttpError, ctrlWrapper, sendEmail } = require("../../helpers");
const {
  User,
  userRegisterSchema,
  userLoginSchema,
  userUpdateSubscrSchema,
  userVarifySchema,
} = require("../../models/user");
const jwt = require("jsonwebtoken");
require("dotenv");
const { SEKRET_KEY, PROJECT_URL } = process.env;
const gravatar = require("gravatar");
const path = require("path");
const { nanoid } = require("nanoid");

const fs = require("fs/promises");
const Jimp = require("jimp");

const register = async (req, res, next) => {
  const { error } = userRegisterSchema.validate(req.body);
  if (error) {
    throw HttpError(401, error.message);
  }
  const newUser = {
    password: req.body.password,
    email: req.body.email,
    subscription: req.body.subscription,
  };
  try {
    const currentUser = await User.findOne({ email: newUser.email });
    if (currentUser) {
      return res.status(409).json({ message: "User already exists." });
    }
    newUser.password = await bcrypt.hash(newUser.password, 10);
    const avatarURL = gravatar.url(newUser.email, { s: "250" });

    newUser.avatarURL = avatarURL;

    const verificationCode = nanoid();
    newUser.verificationCode = verificationCode;

    await User.create(newUser);
    const verifyEmail = {
      to: newUser.email,
      subject: "Verify email",
      html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationCode}">Click to verify your email</a>`,
    };

    await sendEmail(verifyEmail);
    return res.status(201).end();
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { error } = userLoginSchema.validate(req.body);
  if (error) {
    throw HttpError(401, error.message);
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !user.verify) {
      return res.status(401).json({ error: "Email or password is incorrect." });
    }
    const isMAtch = await bcrypt.compare(password, user.password);

    if (!isMAtch) {
      return res.status(401).json({ error: "Email or passward is incorrect." });
    }

    const { _id: id, email: userEmail, subscription } = user;

    const payload = { id };
    const token = jwt.sign(payload, SEKRET_KEY, { expiresIn: "3h" });
    await User.findByIdAndUpdate(id, { token });
    res.json({ token, user: { email: userEmail, subscription } });
  } catch (error) {
    return next(error);
  }
};
const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(404, "User is not verified");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });
  res.json({ message: "Verification is successful" });
};

const resendVerifyEmail = async (req, res) => {
  const { error } = userVarifySchema.validate(req.body);
  if (error) {
    throw HttpError(401, error.message);
  }

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "Not found");
  }
  if (user.verify) {
    throw HttpError(400, "Email has already been verified");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${user.verificationCode}">Click to verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verify email send" });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({ message: "Logout success" });
};

const patchSubscr = async (req, res, next) => {
  const { error } = userUpdateSubscrSchema.validate(req.body);
  if (error) {
    throw HttpError(401, error.message);
  }
  const { _id } = req.user;
  const result = await User.findByIdAndUpdate(_id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.json(result);
};

const patchAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const avatarDir = path.join(__dirname, "..", "..", "public", "avatars");
  const { path: tempUpload, originalname } = req.file;

  const imageDir = path.join(__dirname, "..", "..", "temp", originalname);
  const image = await Jimp.read(imageDir);
  image.resize(250, 250);
  image.write(imageDir);

  const fileName = `${_id}_${originalname}`;
  const resultUplaod = path.join(avatarDir, fileName);
  await fs.rename(tempUpload, resultUplaod);
  const avatarURL = path.join("avatars", originalname);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({ avatarURL });
};
module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent,
  logout: ctrlWrapper(logout),
  patchSubscr: ctrlWrapper(patchSubscr),
  patchAvatar: ctrlWrapper(patchAvatar),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
