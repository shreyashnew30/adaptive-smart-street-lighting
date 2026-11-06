
import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";

import connectDB from "./config/db.js";

import { connectMQTT } from "./config/mqtt.js";

import {
    initializeMQTTHandlers
} from "./services/mqttService.js";

import Pole from "./models/Pole.js";

import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

// Mark poles offline when no recent heartbeat is received.

const startOfflineMonitor = () => {

    setInterval(async () => {

        try {

            const offlineTime = new Date(
                Date.now() - 60000
            );

            const result = await Pole.updateMany(
                {
                    online: true,
                    lastSeen: {
                        $lt: offlineTime
                    }
                },
                {
                    $set: {
                        online: false
                    }
                }
            );

            if (result.modifiedCount > 0) {

                logger.warn(
                    `${result.modifiedCount} pole(s) marked offline`
                );

            }

        } catch (error) {

            logger.error(
                `Offline monitor error: ${error.message}`
            );

        }

    }, 15000);

};

const startServer = async () => {

    try {

        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in .env");
        }

        // Connect database first.

        await connectDB();

        // Initialize MQTT.

        connectMQTT();

        initializeMQTTHandlers();

        // Start offline monitoring.

        startOfflineMonitor();

        // Start Express server.

        app.listen(PORT, () => {

            logger.info(
                `Server running at http://localhost:${PORT}`
            );

        });

    } catch (error) {

        logger.error(
            `Server startup failed: ${error.message}`
        );

        process.exit(1);

    }

};

startServer();
