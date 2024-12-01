const express = require("express");
const { verifyInitData } = require("../controllers/verifyController.js");

const router = express.Router();

// Define the POST route for /api/verify
router.post("/", verifyInitData);

module.exports = router;
