
import express from "express";

import {
    receiveSensorData,
    getSensorHistory
} from "../controllers/sensorController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, receiveSensorData);

router.get("/:poleId", protect, getSensorHistory);

export default router;
