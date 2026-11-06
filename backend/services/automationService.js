
import Pole from "../models/Pole.js";
import { getAutomaticLightStatus } from "../utils/threshold.js";
import { sendPoleCommand } from "./mqttService.js";
import logger from "../utils/logger.js";

export const processAutomaticLighting = async (
    pole,
    reading
) => {

    if (pole.mode !== "AUTO") {
        return null;
    }

    const newStatus = getAutomaticLightStatus(
        reading,
        pole.status,
        pole.darkThreshold,
        pole.brightThreshold
    );

    if (newStatus === pole.status) {
        return null;
    }

    // Only issue a command if MQTT is connected.
    const result = await sendPoleCommand(
        pole.poleId,
        newStatus,
        "AUTOMATION"
    );

    if (!result.success) {

        logger.warn(
            `Automatic command not sent to ${pole.poleId}`
        );

        return null;
    }

    await Pole.findOneAndUpdate(
        { poleId: pole.poleId },
        {
            $set: {
                status: newStatus
            }
        }
    );

    logger.info(
        `${pole.poleId} automatic command: ${newStatus}`
    );

    return newStatus;

};
