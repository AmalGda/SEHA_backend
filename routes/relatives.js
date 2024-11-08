var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Relative = require("../models/relatives");
const { ObjectId } = require("mongoose").Types;
const checkRequestKey = require("../middlewares/checRequestKey");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get/:_id?", authMiddleware, async (req, res) => {
  /**
   * Destructuration params
   * @params relative _id
   */
  const { _id } = req.params;

  try {
    // Get user id
    const user = req.user;

    const query = _id ? { user_id: user, _id } : { user_id: user };
    const resDocs = await Relative.find(query).select("-user_id");

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
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* Add a new relative*/
router.post("/add-relatives", authMiddleware, async (req, res) => {
  // Get user id
  const user = req.user;

  // Add user directly in req.body
  req.body = { ...req.body, user_id: user };

  try {
    //Add a new vehicle
    const newRelative = new Relative({
      ...req.body,
    });

    const newDoc = await newRelative.save();

    newDoc && res.json({ result: true, relative: newDoc });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: true, error: "An error has occurred" });
  }
});

/* update data of relatives persons */
router.put("/update/", authMiddleware, async (req, res) => {
  try {
    const _id = req.body._id;

    const relativeDoc = await Relative.findOneAndUpdate(
      { _id },

      { $set: { ...req.body } },

      { new: true }
    );
    res.json({ result: true, relative: relativeDoc });
  } catch (error) {
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* delte a relative person*/
const delParams = { request: "params", key: ["relative_id"] };
router.delete(
  "/delete/:relative_id",
  authMiddleware,
  checkRequestKey(delParams),
  async (req, res) => {
    /**
     * Destructuration params
     * @params token, vehicle id
     */
    const { relative_id } = req.params;

    // Get user id
    const user = req.user;

    if (user) {
      //Find user's vehicles
      const deleteDoc = await Relative.deleteOne({
        user_id: user,
        _id: relative_id,
      });
      let json;
      if (deleteDoc.deletedCount > 0) {
        json = { result: true, message: `Relative ${relative_id} deleted` };
      } else {
        json = { result: false, error: `Relative ${relative_id} not found` };
      }
    } else {
      // Bad request
      res.status(400).json({ result: false, error: "User not found" });
    }
  }
);

module.exports = router;
