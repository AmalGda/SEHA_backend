var express = require("express");
var router = express.Router();
const checkRequestKey = require("../middlewares/checRequestKey");
const authMiddleware = require("../middlewares/authMiddleware");
const Pathology = require("../models/pathologies");
const Relative = require("../models/relatives");
const User = require("../models/users");

/* Get pathology data for relative */
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

    const noSelect = ["_id", "-__v"];
    const resDocs = await Pathology.find({ relative_id }).select(noSelect);

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

/* Get pathology data for user */
router.get("/get/:user_id/", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }
    console.log("user_id:", user_id);

    const noSelect = ["_id", "-__v"];
    const resDocs = await Pathology.find({ user_id }).select(noSelect);

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

/* Get symptoms data for relative  */
router.get("/get/symptoms/:relative_id/", authMiddleware, async (req, res) => {
  const { relative_id } = req.params;
  const user_id = req.user;
  try {
    const relative = await Relative.findOne({ _id: relative_id, user_id });
    if (!relative) {
      return res.status(403).json({ result: false, error: "Access denied" });
    }
    const symptoms = await Pathology.find().select("symptoms -_id");

    if (symptoms.length === 0) {
      return res
        .status(404)
        .json({ result: false, error: "symptoms not found" });
    }
    res.json({
      result: true,
      symptoms: symptoms,
      number_symptoms: symptoms.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* Get symptoms data for relative  */
router.get("/get/symptoms/:user_id/", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }
    const symptoms = await Pathology.find().select("symptoms -_id");

    if (symptoms.length === 0) {
      return res
        .status(404)
        .json({ result: false, error: "symptoms not found" });
    }
    res.json({
      result: true,
      symptoms: symptoms,
      number_symptoms: symptoms.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* Get treatments data of relative people */
router.get(
  "/get/treatments/:relative_id/",
  authMiddleware,
  async (req, res) => {
    const { relative_id } = req.params;
    const user_id = req.user;
    try {
      const relative = await Relative.findOne({ _id: relative_id, user_id });
      if (!relative) {
        return res.status(403).json({ result: false, error: "Access denied" });
      }
      const treatments = await Pathology.find().select("treatments -_id");

      if (treatments.length === 0) {
        return res
          .status(404)
          .json({ result: false, error: "treatments not found" });
      }
      res.json({
        result: true,
        treatments: treatments,
        number_treatments: treatments.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ result: false, error: "An error has occurred" });
    }
  }
);

/* Get treatments data of user */
router.get("/get/treatments/:user_id/", authMiddleware, async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }
    const treatments = await Pathology.find().select("treatments -_id");

    if (treatments.length === 0) {
      return res
        .status(404)
        .json({ result: false, error: "treatments not found" });
    }
    res.json({
      result: true,
      treatments: treatments,
      number_treatments: treatments.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* Add a new pathology for relative people */
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

/* Add a new pathology for user */
const addThePathology = {
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
  "/add-pathology/:user_id",
  authMiddleware,
  checkRequestKey(addPathology),
  async (req, res) => {
    const { user_id } = req.params;

    const {
      name,
      yearOfScreening,
      nameOfDiagnosticPhysician,
      symptoms,
      treatmentInProgress,
      additionalComment,
      treatments,
    } = req.body;

    if (req.user._id !== user_id) {
      return res
        .status(403)
        .json({ result: false, error: "Forbidden: User mismatch" });
    }
    try {
      //Add a new pathology
      const newPathology = new Pathology({
        user_id,
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

/* Add a new treatment */
const addTreatmentParam = {
  key: [
    "pathology_id",
    "brand",
    "dosage",
    "halfOrWhole",
    "frequency",
    "lenghOfTreatment",
    "sideEffect"[{}],
    "drugAdministration",
    "modeAdministration",
    "treatmentStartDate",
    "treatmentEndDate",
  ],
};
router.post("/treatment/add", authMiddleware, async (req, res) => {
  const { pathology_id, relative_id, treatments } = req.body;
  const user_id = req.user;
  console.log("ton console", req.body);
  try {
    // Vérification que l'utilisateur a accès au proche
    const relative = await Relative.findOne({ _id: relative_id, user_id });
    console.log(req.user);
    console.log("la requete");

    if (!relative) {
      return res.status(403).json({
        result: false,
        message: "Access denied to this relative",
      });
    }

    // Ajout du traitement à la pathologie
    const updateResult = await Pathology.updateOne(
      { _id: pathology_id, relative_id: relative_id },
      {
        $push: {
          treatments: treatments, // Ajout du sous-document
        },
      },
      { runValidators: true } // Valide les champs du sous-document
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        result: false,
        message: "Pathology not found",
      });
    }

    return res.status(200).json({
      result: true,
      message: "Treatment added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: false,
      error: "An error has occurred",
    });
  }
});

/* Add a new treatment */
const addTreatmentParamUSer = {
  key: [
    "pathology_id",
    "brand",
    "dosage",
    "halfOrWhole",
    "frequency",
    "lenghOfTreatment",
    "sideEffect"[{}],
    "drugAdministration",
    "modeAdministration",
    "treatmentStartDate",
    "treatmentEndDate",
  ],
};
router.post(
  "/treatment/add",
  authMiddleware,
  checkRequestKey(addTreatmentParamUSer),
  async (req, res) => {
    const { pathology_id, user_id, treatments } = req.body;
    console.log("ton console", req.body);
    try {
      const user = await User.findOne({ _id: user_id });

      if (!user) {
        return res.status(404).json({
          result: false,
          message: "User not found",
        });
      }

      // Ajout du traitement à la pathologie
      const updateResult = await Pathology.updateOne(
        { _id: pathology_id, user_id: user_id },
        {
          $push: {
            treatments: treatments, // Ajout du sous-document
          },
        },
        { runValidators: true } // Valide les champs du sous-document
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({
          result: false,
          message: "Pathology not found",
        });
      }

      return res.status(200).json({
        result: true,
        message: "Treatment added successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        error: "An error has occurred",
      });
    }
  }
);

/* Add a new symptoms relative */
router.post("/symptom/add", authMiddleware, async (req, res) => {
  const { pathology_id, relative_id, symptoms } = req.body;
  const user_id = req.user;
  try {
    // Vérification que l'utilisateur a accès au proche
    const relative = await Relative.findOne({ _id: relative_id, user_id });

    if (!relative) {
      return res.status(403).json({
        result: false,
        message: "Access denied to this relative",
      });
    }

    // Ajout du traitement à la pathologie
    const updateResult = await Pathology.updateOne(
      { _id: pathology_id, relative_id: relative_id },
      {
        $push: {
          symptoms: symptoms, // Ajout du sous-document
        },
      },
      { runValidators: true } // Valide les champs du sous-document
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        result: false,
        message: "Pathology not found",
      });
    }
    return res.status(200).json({
      result: true,
      message: "Symptoms added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: false,
      error: "An error has occurred",
    });
  }
});

/* Add a new symptoms user */
router.post("/symptom/add", authMiddleware, async (req, res) => {
  const { pathology_id, user_id, symptoms } = req.body;

  try {
    // Vérification que l'utilisateur a accès au proche
    const user = await User.findOne({ _id: user_id });

    if (!user) {
      return res.status(404).json({
        result: false,
        message: "User not found",
      });
    }

    // Ajout du traitement à la pathologie
    const updateResult = await Pathology.updateOne(
      { _id: pathology_id, user_id: user_id },
      {
        $push: {
          symptoms: symptoms, // Ajout du sous-document
        },
      },
      { runValidators: true } // Valide les champs du sous-document
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        result: false,
        message: "Pathology not found",
      });
    }
    return res.status(200).json({
      result: true,
      message: "Symptoms added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      result: false,
      error: "An error has occurred",
    });
  }
});

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
/* UPDATE PATHOLOGY FOR RELATIVE  */
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

/* UPDATE PATHOLOGY FOR USER */
router.put("/update/:user_id", authMiddleware, async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.status(404).json({ result: false, message: "User not found" });
    }

    const { pathology_id } = req.body;
    if (!pathology_id) {
      return res
        .status(400)
        .json({ result: false, message: "Pathology ID is required" });
    }

    const pathology = await Pathology.findOneAndUpdate(
      { _id: pathology_id, user_id },
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

module.exports = router;
