const mongoose = require("mongoose");

const treatmentsSchema = mongoose.Schema(
  {
    brand: { type: String },
    dosage: { type: String },
    halfOrWhole: { type: Boolean },
    frequency: {
      type: String,
      enum: ["quotidien", "hebdomadaire", "mensuel", "annuel"],
    },
    lenghOfTreatment: { type: String },
    sideEffect: [{ sideEffect: String }],
    drugAdministration: { type: String },
    modeAdministration: { type: String },
    treatmentStartDate: { type: Date },
    treatmentEndDate: { type: Date },
  },
  { timestamps: true }
);

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
    treatments: [treatmentsSchema],
    additionalComment: { type: String },
  },
  { timestamps: true }
);

const Pathology = mongoose.model("pathologies", pathologySchema);

module.exports = Pathology;
