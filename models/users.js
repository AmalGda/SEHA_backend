const mongoose = require("mongoose");

const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const socialLoginSchema = mongoose.Schema(
  {
    google_id: { type: String, default: null },
    facebook_id: { type: String, default: null },
    apple_id: { type: String, default: null },
  },
  { timestamps: true }
);

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (val) => EMAIL_REGEX.test(val),
        message: ({ value }) => `${value} is not an email`,
      },
    },
    yearOfBirth: { type: Date },
    password: { type: String, required: true, unique: true },
    token: String,
    socialLoginSchema: socialLoginSchema,
    relatives: [{ type: mongoose.Schema.Types.ObjectId, ref: "Relative" }],
    pathologies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pathology" }],
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
