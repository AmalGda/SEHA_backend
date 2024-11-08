const mongoose = require("mongoose");

const relativeSchema = mongoose.Schema({
  firtsname: { type: String, trim: true },
  lastname: { type: String, trim: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "User ID is required."],
  },
  pathologies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pathology" }],
  gender: { type: String },
  yearOfBirth: { type: Date },
  city: { type: String },
});

const Relative = mongoose.model("relatives", relativeSchema);
module.exports = Relative;
