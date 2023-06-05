const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User } = require("../models/user");
const { SEKRET_KEY } = process.env;
const { HttpError } = require("../helpers");

const authenticate = async (req, res, next) => {
  const { authorization = "" } = req.headers;

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, SEKRET_KEY);

    const user = await User.findById(id);
    if (!user || !user.token) {
      next(HttpError(401, "user"));
    }

    req.user = user;

    next();
  } catch (error) {
    next(HttpError(401, "Not authorized"));
  }
};

module.exports = authenticate;
