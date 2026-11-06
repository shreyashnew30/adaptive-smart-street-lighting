
import Pole from "../models/Pole.js";

export const getAllPoles = async (req, res, next) => {

    try {

        const poles = await Pole.find().sort({ poleId: 1 });

        res.status(200).json({
            success: true,
            data: poles
        });

    } catch (error) {

        next(error);

    }

};

export const getPoleById = async (req, res, next) => {

    try {

        const pole = await Pole.findOne({
            poleId: req.params.poleId
        });

        if (!pole) {
            return res.status(404).json({
                success: false,
                message: "Pole not found"
            });
        }

        res.status(200).json({
            success: true,
            data: pole
        });

    } catch (error) {

        next(error);

    }

};

export const createPole = async (req, res, next) => {

    try {

        const { poleId, location } = req.body;

        if (!poleId || !location) {

            return res.status(400).json({
                success: false,
                message: "Pole ID and location are required"
            });

        }

        const existing = await Pole.findOne({ poleId });

        if (existing) {

            return res.status(409).json({
                success: false,
                message: "Pole ID already exists"
            });

        }

        const pole = await Pole.create({
            poleId,
            location
        });

        res.status(201).json({
            success: true,
            message: "Pole registered successfully",
            data: pole
        });

    } catch (error) {

        next(error);

    }

};

export const deletePole = async (req, res, next) => {

    try {

        const pole = await Pole.findOneAndDelete({
            poleId: req.params.poleId
        });

        if (!pole) {

            return res.status(404).json({
                success: false,
                message: "Pole not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Pole deleted successfully"
        });

    } catch (error) {

        next(error);

    }

};
