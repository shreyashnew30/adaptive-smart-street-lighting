
import Pole from "../models/Pole.js";
import Command from "../models/Command.js";
import { sendPoleCommand } from "../services/mqttService.js";

export const controlPole = async (req, res, next) => {

    try {

        const { poleId } = req.params;
        const { action } = req.body;

        if (!["ON", "OFF"].includes(action)) {

            return res.status(400).json({
                success: false,
                message: "Action must be ON or OFF"
            });

        }

        const pole = await Pole.findOne({ poleId });

        if (!pole) {

            return res.status(404).json({
                success: false,
                message: "Pole not found"
            });

        }

        if (!pole.online) {

            return res.status(409).json({
                success: false,
                message: "Pole is offline"
            });

        }

        if (pole.mode !== "MANUAL") {

            return res.status(409).json({
                success: false,
                message: "Switch pole to MANUAL mode before controlling it"
            });

        }

        const result = await sendPoleCommand(
            poleId,
            action,
            "ADMIN"
        );

        if (!result.success) {

            return res.status(503).json(result);

        }

        pole.manualOverride = action;

        await pole.save();

        res.status(202).json({
            success: true,
            message: "Command sent. Waiting for hardware acknowledgement.",
            commandId: result.commandId,
            data: {
                poleId,
                action,
                status: "SENT"
            }
        });

    } catch (error) {

        next(error);

    }

};

export const setPoleMode = async (req, res, next) => {

    try {

        const { poleId } = req.params;
        const { mode } = req.body;

        if (!["AUTO", "MANUAL"].includes(mode)) {

            return res.status(400).json({
                success: false,
                message: "Mode must be AUTO or MANUAL"
            });

        }

        const pole = await Pole.findOne({ poleId });

        if (!pole) {

            return res.status(404).json({
                success: false,
                message: "Pole not found"
            });

        }

        if (!pole.online) {

            return res.status(409).json({
                success: false,
                message: "Pole is offline"
            });

        }

        const result = await sendPoleCommand(
            poleId,
            mode,
            "ADMIN"
        );

        if (!result.success) {

            return res.status(503).json(result);

        }

        pole.mode = mode;

        if (mode === "AUTO") {
            pole.manualOverride = null;
        }

        await pole.save();

        res.status(202).json({
            success: true,
            message: `${poleId} mode command sent`,
            commandId: result.commandId
        });

    } catch (error) {

        next(error);

    }

};

export const setGlobalMode = async (req, res, next) => {

    try {

        const { mode } = req.body;

        if (!["AUTO", "MANUAL"].includes(mode)) {

            return res.status(400).json({
                success: false,
                message: "Invalid global mode"
            });

        }

        const poles = await Pole.find({ online: true });

        const results = await Promise.all(
            poles.map(async (pole) => {

                const result = await sendPoleCommand(
                    pole.poleId,
                    mode,
                    "ADMIN"
                );

                if (result.success) {

                    pole.mode = mode;

                    if (mode === "AUTO") {
                        pole.manualOverride = null;
                    }

                    await pole.save();

                }

                return {
                    poleId: pole.poleId,
                    success: result.success,
                    message: result.message
                };

            })
        );

        const succeeded = results.filter(
            result => result.success
        ).length;

        res.status(200).json({
            success: true,
            message: "Global mode commands processed",
            requestedMode: mode,
            totalOnline: poles.length,
            commandsSent: succeeded,
            results
        });

    } catch (error) {

        next(error);

    }

};

export const getCommandHistory = async (req, res, next) => {

    try {

        const commands = await Command.find({
            poleId: req.params.poleId
        })
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            data: commands
        });

    } catch (error) {

        next(error);

    }

};
