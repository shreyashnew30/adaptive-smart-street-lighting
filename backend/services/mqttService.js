
import { getMQTTClient } from "../config/mqtt.js";
import Pole from "../models/Pole.js";
import Command from "../models/Command.js";
import SensorData from "../models/SensorData.js";
import {
    processAutomaticLighting
} from "./automationService.js";
import logger from "../utils/logger.js";

let handlersInitialized = false;

export const initializeMQTTHandlers = () => {

    const client = getMQTTClient();

    if (!client || handlersInitialized) return;

    handlersInitialized = true;

    client.on("connect", () => {

        client.subscribe(
            "streetlight/+/sensor",
            { qos: 1 }
        );

        client.subscribe(
            "streetlight/+/status",
            { qos: 1 }
        );

        client.subscribe(
            "streetlight/+/ack",
            { qos: 1 }
        );

    });

    client.on("message", async (topic, message) => {

        try {

            const parts = topic.split("/");

            const poleId = parts[1];
            const messageType = parts[2];

            const data = JSON.parse(message.toString());

            if (messageType === "sensor") {

                await handleSensorData(poleId, data);

            } else if (messageType === "status") {

                await handlePoleStatus(poleId, data);

            } else if (messageType === "ack") {

                await handleAcknowledgement(poleId, data);

            }

        } catch (error) {

            logger.error(
                `MQTT message processing failed: ${error.message}`
            );

        }

    });

};

async function handleSensorData(poleId, data) {

    const reading = Number(data.ldrReading);

    if (
        !Number.isFinite(reading) ||
        reading < 0 ||
        reading > 4095
    ) {
        throw new Error("Invalid LDR reading");
    }

    let pole = await Pole.findOne({ poleId });

    if (!pole) {

        logger.warn(`Unknown pole: ${poleId}`);

        return;
    }

    pole.ldrReading = reading;
    pole.online = true;
    pole.lastSeen = new Date();

    await pole.save();

    // Save sensor history.
    await SensorData.create({
        poleId,
        ldrReading: reading,
        lightStatus: pole.status,
        mode: pole.mode
    });

    // Run automatic lighting decision.
    await processAutomaticLighting(pole, reading);

}

async function handlePoleStatus(poleId, data) {

    const pole = await Pole.findOne({ poleId });

    if (!pole) return;

    pole.online = true;
    pole.lastSeen = new Date();

    if (data.lightStatus === "ON" || data.lightStatus === "OFF") {
        pole.status = data.lightStatus;
    }

    await pole.save();

}

async function handleAcknowledgement(poleId, data) {

    if (!data.commandId) return;

    const command = await Command.findOne({
        _id: data.commandId,
        poleId
    });

    if (!command) return;

    const success = data.success === true;

    command.status = success
        ? "ACKNOWLEDGED"
        : "FAILED";

    if (success) {
        command.acknowledgedAt = new Date();
    }

    await command.save();

    if (success && ["ON", "OFF"].includes(command.action)) {

        await Pole.findOneAndUpdate(
            { poleId },
            {
                $set: {
                    status: command.action,
                    online: true,
                    lastSeen: new Date()
                }
            }
        );

    }

}

export const sendPoleCommand = async (
    poleId,
    action,
    source = "ADMIN"
) => {

    const client = getMQTTClient();

    if (!client || !client.connected) {

        return {
            success: false,
            message: "MQTT broker is not connected"
        };

    }

    const command = await Command.create({
        poleId,
        action,
        source,
        status: "PENDING"
    });

    const topic = `streetlight/${poleId}/command`;

    const payload = JSON.stringify({
        commandId: command._id.toString(),
        action,
        source,
        timestamp: new Date().toISOString()
    });

    return new Promise((resolve) => {

        client.publish(
            topic,
            payload,
            { qos: 1 },
            async (error) => {

                if (error) {

                    command.status = "FAILED";
                    await command.save();

                    return resolve({
                        success: false,
                        message: error.message
                    });

                }

                command.status = "SENT";
                await command.save();

                resolve({
                    success: true,
                    message: "Command published",
                    commandId: command._id
                });

            }
        );

    });

};
