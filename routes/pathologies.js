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
    "treatmentInProgress",
    "treatments",
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
        treatments,
      } = req.body;

      //Add a new pathology
      const newPathology = new Pathology({
        relative_id,
        name,
        yearOfScreening,
        nameOfDiagnosticPhysician,
        symptoms,
        treatments,
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
/* DELETE ROUTE*/
router.delete("/delete/:relative_id", authMiddleware, async (req, res) => {
  const { relative_id } = req.params;
  const user_id = req.user;
  try {
    const relative = await Relative.findOne({ _id: relative_id, user_id });
    if (!relative) {
      return res

        .status(404)

        .json({ result: false, message: "Acces denied" });
    }
    const { pathology_id } = req.body;
    if (!pathology_id) {
      return res
        .status(400)
        .json({ result: false, message: "Pathology ID is required" });
    }

    const pathology = await Pathology.findOneAndDelete({ _id: pathology_id });
    if (!pathology) {
      return res

        .status(404)

        .json({ result: false, message: "Pathology not found" });
    }
    return res.status(200).json({ result: true, message: "Pathology deleted" });
  } catch (err) {
    console.log(err);

    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});
/* UPDATE ROUTE */
router.put("/update/:relative_id", authMiddleware, async (req, res) => {
  const { relative_id } = req.params;
  const user_id = req.user;
  try {
    const relative = await Relative.findOne({ _id: relative_id, user_id });
    if (!relative) {
      return res.status(404).json({ result: false, message: "Access denied" });
    }

    const { pathology_id } = req.body;
    if (!pathology_id) {
      return res
        .status(400)
        .json({ result: false, message: "Pathology ID is required" });
    }

    const pathology = await Pathology.findOneAndUpdate(
      { _id: pathology_id, relative_id },
      { $set: { ...req.body } },
      { new: true }
    );

    if (!pathology) {
      return res
        .status(404)
        .json({ result: false, message: "Pathology not found" });
    }

    return res.status(200).json({ result: true, pathologyDoc: pathology });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: false, error: "An error has occurred" });
  }
});

/* POST TREATMENT*/
const addTreatmentParam = {
  key: ["pathology_id", "treatment[brand]", "expenses[category]"],
};
router.post("/treatment/add", authMiddleware, async (req, res) => {
  const { pathology_id } = req.body;
  const { relative_id } = req.body;
  try {
    const addExpense = await Pathology.updateOne({
      $and: [{ relative_id: relative_id }, { _id: pathology_id }],
    });
  } catch (error) {}
});

module.exports = router;
