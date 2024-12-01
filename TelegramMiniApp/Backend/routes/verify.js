import express from "express";
import { verifyInitData } from "../controllers/verifyController.js";

const router = express.Router();

// Define the POST route for /api/verify
router.post("/", verifyInitData);

export default router;
