var express = require("express");
var router = express.Router();
const checkRequestKey = require("../middlewares/checRequestKey");
const authMiddleware = require("../middlewares/authMiddleware");
const Pathology = require("../models/pathologies");
const Relative = require("../models/relatives");
const User = require("../models/users");

/* Get pathology data */
router.get("/get/:relative_id", authMiddleware, async (req, res) => {
  try {
    const { relative_id } = req.params;
    const pathologyDoc = await Pathology.findOne({ _id }).select;
    if (pathologyDoc) {
      res.json({ result: true, pathologyDoc: pathologyDoc });
    } else {
      res.json({ result: false, user: "no data" });
    }
  } catch (error) {
    res.status(500).json({ result: true, error: "An error has occurred" });
  }
});

/* Add new pathology */
const addPathology = {
  request: "body",
  key: [
    "name",
    "yearOfScreening",
    "nameOfDiagnosticPhysician",
    "symptoms",
    "treatmentInProgress" /* "treatments" */,
    "additionalComment",
  ],
};
router.post(
  "/add-pathology/:relative_id",
  authMiddleware,
  checkRequestKey(addPathology),
  async (req, res) => {
    try {
      const { relative_id } = req.params;

      const {
        name,
        yearOfScreening,
        nameOfDiagnosticPhysician,
        symptoms,
        treatmentInProgress,
        additionalComment,
      } = req.body;

      //Add a new pathology
      const newPathology = new Pathology({
        relative_id,
        name,
        yearOfScreening,
        nameOfDiagnosticPhysician,
        symptoms,
        treatmentInProgress,
        additionalComment,
      });
      const newDoc = await newPathology.save();
      newDoc && res.json({ result: true, pathology: newDoc });
    } catch (error) {
      res.status(500).json({ result: true, error: "An error has occurred" });
    }
  }
);

module.exports = router;
