
import express from "express";

import {
    controlPole,
    setPoleMode,
    setGlobalMode,
    getCommandHistory
} from "../controllers/controlController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:poleId", protect, controlPole);

router.patch("/:poleId/mode", protect, setPoleMode);

router.patch("/global-mode", protect, setGlobalMode);

router.get("/:poleId/history", protect, getCommandHistory);

export default router;
