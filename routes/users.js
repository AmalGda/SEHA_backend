var express = require("express");
var router = express.Router();
const User = require("../models/users");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const checkRequestKey = require("../middlewares/checRequestKey");

/* GET users datas */
router.get("/get/:token", async (req, res) => {
  const token = req.params.token;
  try {
    const noSelect = ["-password"];
    const userDoc = await User.findOne({ token }).select(noSelect);
    if (userDoc) {
      res.json({ result: true, userDoc: userDoc });
    } else {
      res.json({ result: false, user: "no data" });
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* SIGN UP USERS */
const signUpParams = {
  request: "body",
  key: ["firstname", "lastname", "email", "yearOfBirth", "password"],
};
router.post("/signup", checkRequestKey(signUpParams), async (req, res) => {
  const { firstname, lastname, email, yearOfBirth, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });
    if (userDoc === null) {
      const hash = bcrypt.hashSync(password, 10);
      const newUser = new User({
        firstname,
        lastname,
        email,
        yearOfBirth,
        password: hash,
        token: uid2(32),
      });
      const newDoc = await newUser.save();
      res.json({ result: true, email: newDoc.email, token: newDoc.token });
    } else {
      res.json({
        result: false,
        error: "Nom d'utilisateur ou addresse e-mail déjà utilisé",
        notification: true,
      });
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* SIGN IN USERS */
const signInParams = {
  request: "body",
  key: ["username", "password"],
};
router.post("/signin", checkRequestKey(signInParams), async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });

    if (userDoc && bcrypt.compareSync(password, userDoc.password)) {
      res.json({ result: true, token: userDoc.token });
    } else {
      res.json({
        result: false,
        error: "Utlisateur non trouvé ou mauvais mot de passe.",
        notification: true,
      });
    }
  } catch (error) {
    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/*  ROUTE PUT */
const updateParam = { request: "body", key: ["token"] };

router.put("/update", checkRequestKey(updateParam), async (req, res) => {
  try {
    const token = req.body.token;

    const userDoc = await User.findOneAndUpdate(
      { token },

      { $set: { ...req.body } },

      { new: true }
    );

    res.json({ result: true, user: userDoc });
  } catch (err) {
    console.log(err);

    res.status(500).json({ result: false, error: "An error has occurred" });
  }
});

/* ROUTE DELETE */
const delParams = { request: "params", key: ["firstname"] };

router.delete(
  "/delete/:firstname",
  checkRequestKey(delParams),
  async (req, res) => {
    const firstname = req.params.firstname;

    try {
      const user = await User.findOneAndDelete({ firstname });

      if (!user) {
        return res
          .status(404)
          .json({ result: false, message: "Company not found" });
      }

      return res.status(200).json({ result: true, message: "Company deleted" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ result: false, error: "An error has occurred" });
    }
  }
);

module.exports = router;
