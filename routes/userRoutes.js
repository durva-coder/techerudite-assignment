const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

// User Registration Routes
router.post("/register", userController.register); // Customer and Admin Registration

// Email Verification Route
router.get("/verify-email", userController.verifyEmail); // Email verification

// Login Routes
router.post("/login/admin", userController.adminLogin); // Admin Login
router.post("/login/customer", userController.customerLogin); // Customer Login

module.exports = router;
