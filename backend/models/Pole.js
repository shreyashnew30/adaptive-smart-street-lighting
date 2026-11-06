
import mongoose from "mongoose";

const poleSchema = new mongoose.Schema({

    poleId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    location: {
        type: String,
        required: true,
        trim: true
    },

    ldrReading: {
        type: Number,
        default: 0,
        min: 0
    },

    status: {
        type: String,
        enum: ["ON", "OFF"],
        default: "OFF"
    },

    mode: {
        type: String,
        enum: ["AUTO", "MANUAL"],
        default: "AUTO"
    },

    online: {
        type: Boolean,
        default: false
    },

    manualOverride: {
        type: String,
        enum: ["ON", "OFF", null],
        default: null
    },

    darkThreshold: {
        type: Number,
        default: Number(process.env.LDR_DARK_THRESHOLD) || 300
    },

    brightThreshold: {
        type: Number,
        default: Number(process.env.LDR_BRIGHT_THRESHOLD) || 500
    },

    lastSeen: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

const Pole = mongoose.model("Pole", poleSchema);

export default Pole;
