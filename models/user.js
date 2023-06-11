const { Schema, model } = require("mongoose");
const Joi = require("joi");
const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: { type: String, required: [true, "Set avatar for contact"] },
    token: {
      type: String,
      default: "",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

const userRegisterSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().required(),
  subscription: Joi.string(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});
const userUpdateSubscrSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const userVarifySchema = Joi.object({
  email: Joi.string().required(),
});
const User = model("user", userSchema);
module.exports = {
  User,
  userRegisterSchema,
  userLoginSchema,
  userUpdateSubscrSchema,
  userVarifySchema,
};
