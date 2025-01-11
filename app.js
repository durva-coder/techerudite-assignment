const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const db = require("./models");

const router = require("./routes/userRoutes");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// routers
app.use("/", router);

// Routes
app.get("/register", (req, res) => res.render("register"));
app.get("/verify-email", (req, res) => res.render("verify-email"));
app.get("/admin-login", (req, res) => res.render("admin-login"));
app.get("/customer-login", (req, res) => res.render("customer-login"));

// set up template engines
app.set("view engine", "ejs");

// static files
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.json({ message: "hello from api" });
});

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
