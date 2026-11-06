
import mqtt from "mqtt";
import logger from "../utils/logger.js";

let mqttClient = null;

export const connectMQTT = () => {

    const brokerUrl = process.env.MQTT_URL;

    if (!brokerUrl) {
        logger.warn("MQTT URL not configured");
        return null;
    }

    mqttClient = mqtt.connect(brokerUrl, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,

        reconnectPeriod: 5000,
        connectTimeout: 30000,

        clientId: `smartlight_backend_${Date.now()}`,

        clean: true
    });

    mqttClient.on("connect", () => {

        logger.info("MQTT broker connected");

    });

    mqttClient.on("reconnect", () => {

        logger.info("Reconnecting to MQTT broker...");

    });

    mqttClient.on("error", (error) => {

        logger.error(`MQTT Error: ${error.message}`);

    });

    return mqttClient;

};

export const getMQTTClient = () => mqttClient;
