
import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema({

    poleId: {
        type: String,
        required: true,
        index: true
    },

    ldrReading: {
        type: Number,
        required: true,
        min: 0
    },

    lightStatus: {
        type: String,
        enum: ["ON", "OFF"],
        required: true
    },

    mode: {
        type: String,
        enum: ["AUTO", "MANUAL"],
        default: "AUTO"
    },

    recordedAt: {
        type: Date,
        default: Date.now,
        index: true
    }

}, {
    timestamps: true
});

sensorDataSchema.index({
    poleId: 1,
    recordedAt: -1
});

const SensorData = mongoose.model(
    "SensorData",
    sensorDataSchema
);

export default SensorData;
