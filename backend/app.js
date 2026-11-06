
import express from "express";
import cors from "cors";

import poleRoutes from "./routes/poleRoutes.js";
import sensorRoutes from "./routes/sensorRoutes.js";
import controlRoutes from "./routes/controlRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import {
    notFound,
    errorHandler
} from "./middleware/errorMiddleware.js";

const app = express();

// CORS configuration.

app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Request parsers.

app.use(express.json({ limit: "100kb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "100kb"
}));

// Health check.

app.get("/api/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Smart Street Lighting Backend is running",
        timestamp: new Date().toISOString()
    });

});

// API routes.

app.use("/api/poles", poleRoutes);

app.use("/api/sensors", sensorRoutes);

app.use("/api/control", controlRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/auth", authRoutes);

// Error handling.

app.use(notFound);

app.use(errorHandler);

export default app;
