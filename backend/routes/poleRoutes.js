
import express from "express";

import {
    getAllPoles,
    getPoleById,
    createPole,
    deletePole
} from "../controllers/poleController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPoles);

router.get("/:poleId", getPoleById);

// Admin-only operations.
router.post("/", protect, createPole);

router.delete("/:poleId", protect, deletePole);

export default router;
