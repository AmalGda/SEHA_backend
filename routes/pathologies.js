var express = require("express");
var router = express.Router();
const checkRequestKey = require("../middlewares/checRequestKey");
const authMiddleware = require("../middlewares/authMiddleware");
const Pathology = require("../models/pathologies");
const Relative = require("../models/relatives");
const User = require("../models/users");

/* Get pathology data */
router.get("/get/:relative_id/", authMiddleware, async (req, res) => {
  const { relative_id } = req.params;
  const user_id = req.user;

  try {
    const relative = await Relative.findOne({ _id: relative_id, user_id });
    if (!relative) {
      return res.status(403).json({ result: false, error: "Access denied" });
    }
    console.log("relative_id:", relative_id);
    console.log("user_id:", user_id);

    const resDocs = await Pathology.find({ relative_id });

    if (resDocs.length === 0) {
      return res
        .status(404)
        .json({ result: false, error: "Pathology not found" });
    }
    res.json({
      result: true,
      type: resDocs.length > 1 ? "multiple" : "unique",
      relatives: resDocs,
      number_relatives: resDocs.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "An error has occurred" });
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
        //traitement
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

const delParams = { request: "params", key: ["_id"] };

router.delete(
  "/delete/:_id",

  checkRequestKey(delParams),
  authMiddleware,

  async (req, res) => {
    const _id = req.params._id;
    const user_id = req.user;
    try {
      const relative = await Relative.findOne({ _id: relative_id, user_id });
      const pathology = await Pathology.findOneAndDelete({ _id });

      if (!pathology && relative) {
        return res

          .status(404)

          .json({ result: false, message: "Pathology not found" });
      }

      return res
        .status(200)
        .json({ result: true, message: "Pathology deleted" });
    } catch (err) {
      console.log(err);

      res.status(500).json({ result: false, error: "An error has occurred" });
    }
  }
);
const updateParam = { request: "body", key: ["_id"] };

router.put("/update", checkRequestKey(updateParam), async (req, res) => {
  try {
    const _id = req.body._id;

    const pathologyDoc = await Pathology.findOneAndUpdate(
      { _id },

      { $set: { ...req.body } },

      { new: true }
    );

    res.json({ result: true, pathology: pathologyDoc });
  } catch (err) {
    console.log(err);

    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

module.exports = router;
