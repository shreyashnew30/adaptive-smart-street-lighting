
import mongoose from "mongoose";

const commandSchema = new mongoose.Schema({

    poleId: {
        type: String,
        required: true,
        index: true
    },

    action: {
        type: String,
        enum: ["ON", "OFF", "AUTO", "MANUAL"],
        required: true
    },

    source: {
        type: String,
        enum: ["ADMIN", "AUTOMATION"],
        default: "ADMIN"
    },

    status: {
        type: String,
        enum: ["PENDING", "SENT", "ACKNOWLEDGED", "FAILED"],
        default: "PENDING"
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    acknowledgedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

const Command = mongoose.model("Command", commandSchema);

export default Command;
