const mongoose = require("mongoose");

//Sous document traitement

const pathologySchema = mongoose.Schema(
  {
    relative_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "relatives",
      required: [true, "Relative ID is required."],
    },
    name: { type: String, required: true },
    yearOfScreening: { type: Date },
    nameOfDiagnosticPhysician: { type: String },
    symptoms: [{ type: String }],
    treatmentInProgress: { type: Boolean },
    treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Treatment" }],
    additionalComment: { type: String },
  },
  { timestamps: true }
);

const Pathology = mongoose.model("pathologies", pathologySchema);

module.exports = Pathology;
