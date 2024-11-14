var express = require("express");
var router = express.Router();
const checkRequestKey = require("../middlewares/checRequestKey");
const authMiddleware = require("../middlewares/authMiddleware");
const Pathology = require("../models/pathologies");
const Relative = require("../models/relatives");
const User = require("../models/users");

/* Get pathology data */
router.get("/get/:_id/", authMiddleware, async (req, res) => {
  const { _id } = req.params;
  try {
    const user = req.user;

    const query = _id
      ? { user_id: user, _id, relative_id: relative }
      : { user_id: user, relative_id: relative };
    const resDocs = await Pathology.find(query).select("-relative_id");
    const json =
      resDocs.length > 0
        ? {
            result: true,
            type: resDocs.length > 1 ? "multiple" : "unique",
            relatives: resDocs,
            number_relatives: resDocs.length,
          }
        : { result: false, error: "Relative not found" };

    res.json(json);
    if (resDocs) {
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
