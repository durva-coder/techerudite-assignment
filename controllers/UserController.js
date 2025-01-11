// const { Users, EmailVerification } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const Users = require("../models").Users;
const EmailVerification = require("../models").EmailVerification;

// Function to send email
// const sendVerificationEmail = async (user, token) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "your-email@gmail.com",
//       pass: "your-email-password",
//     },
//   });

//   const mailOptions = {
//     from: "your-email@gmail.com",
//     to: user.email,
//     subject: "Email Verification",
//     text: `Please verify your email by clicking on the following link:
//     http://localhost:5000/verify-email?token=${token}`,
//   };

//   await transporter.sendMail(mailOptions);
// };

const sendVerificationEmail = async (user, token) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io", // Mailtrap SMTP server
    port: 587, // Mailtrap SMTP port
    auth: {
      user: "c704a5e175ad92",
      pass: "6e8ca5eb661124",
    },
  });

  const mailOptions = {
    from: "your-email@example.com", // Your email address
    to: user.email, // Recipient's email
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link:
    http://localhost:3000/verify-email?token=${token}`, // Adjust the verification URL as needed
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// Registration for both Admin and Customer
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await Users.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "customer",
    });

    // Create email verification token
    const token = crypto.randomBytes(20).toString("hex");
    await EmailVerification.create({
      userId: newUser.id,
      token,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
    });

    // Send email verification
    await sendVerificationEmail(newUser, token);

    // res.status(201).json({
    //   message:
    //     "User registered successfully. Please check your email for verification.",
      // });

    res.status(201).render("register", {
      message:
        "User registered successfully. Please check your email for verification.",
    });

      
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const verificationRecord = await EmailVerification.findOne({
      where: { token },
    });

    if (!verificationRecord) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    if (verificationRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token has expired." });
    }

    // Find the user and update their email verification status
    const user = await Users.findByPk(verificationRecord.userId);
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.isVerified = true;
    await user.save();

    // res.status(200).json({ message: "Email verified successfully." });
    res.status(200).render("verification-status", {
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error during email verification." });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not allowed to login from here." });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "your-jwt-secret",
      {
        expiresIn: "1h",
      }
    );

    // res.status(200).json({ message: "Login successful", token });
    res
      .status(200)
      .render("admin-dashboard", { message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// Customer Login
exports.customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first." });
    }

    // Check if the user is a customer
    if (user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "You are not allowed to login from here." });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "your-jwt-secret",
      {
        expiresIn: "1h",
      }
    );

    // res.status(200).json({ message: "Login successful", token });
    res
      .status(200)
      .render("customer-dashboard", { message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during login." });
  }
};
