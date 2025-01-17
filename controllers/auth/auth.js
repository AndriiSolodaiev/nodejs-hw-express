const bcrypt = require("bcrypt");
const { HttpError, ctrlWrapper } = require("../../helpers");
const {
  User,
  userRegisterSchema,
  userLoginSchema,
  userUpdateSubscrSchema,
} = require("../../models/user");
const jwt = require("jsonwebtoken");
require("dotenv");
const { SEKRET_KEY } = process.env;
const gravatar = require("gravatar");
const path = require("path");

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
    await User.create(newUser);
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

    if (!user) {
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
};
