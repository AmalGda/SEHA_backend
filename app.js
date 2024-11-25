require("dotenv").config();
require("./database/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Middleware
const authMiddleware = require("./middlewares/authMiddleware");

// Connection to BDD
require("./database/connection");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var relativesRouter = require("./routes/relatives");
var pathologiesRouter = require("./routes/pathologies");

var app = express();
const cors = require("cors");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/relatives", relativesRouter);
app.use("/pathologies", pathologiesRouter);

module.exports = app;
