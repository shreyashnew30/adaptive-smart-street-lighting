
import Pole from "../models/Pole.js";
import SensorData from "../models/SensorData.js";

export const receiveSensorData = async (req, res, next) => {

    try {

        const { poleId, ldrReading } = req.body;

        const reading = Number(ldrReading);

        if (
            !poleId ||
            !Number.isFinite(reading) ||
            reading < 0 ||
            reading > 4095
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid pole ID or LDR reading"
            });

        }

        const pole = await Pole.findOne({ poleId });

        if (!pole) {

            return res.status(404).json({
                success: false,
                message: "Pole not registered"
            });

        }

        pole.ldrReading = reading;
        pole.online = true;
        pole.lastSeen = new Date();

        await pole.save();

        const record = await SensorData.create({
            poleId,
            ldrReading: reading,
            lightStatus: pole.status,
            mode: pole.mode
        });

        res.status(201).json({
            success: true,
            message: "Sensor data received",
            data: record
        });

    } catch (error) {

        next(error);

    }

};

export const getSensorHistory = async (req, res, next) => {

    try {

        const { poleId } = req.params;

        const limit = Math.min(
            Math.max(Number(req.query.limit) || 100, 1),
            1000
        );

        const history = await SensorData.find({ poleId })
            .sort({ recordedAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {

        next(error);

    }

};
