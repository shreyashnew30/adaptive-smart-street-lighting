
import express from "express";

import {
    getDashboardSummary,
    getAnalytics
} from "../controllers/analyticsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);

router.get("/", protect, getAnalytics);

export default router;
