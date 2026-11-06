
import SensorData from "../models/SensorData.js";

export const saveSensorReading = async (data) => {

    const record = await SensorData.create({
        poleId: data.poleId,
        ldrReading: data.ldrReading,
        lightStatus: data.lightStatus,
        mode: data.mode,
        recordedAt: new Date()
    });

    return record;

};

export const getPoleHistory = async (poleId, limit = 100) => {

    return SensorData.find({ poleId })
        .sort({ recordedAt: -1 })
        .limit(limit);

};
