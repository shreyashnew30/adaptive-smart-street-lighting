
import logger from "../utils/logger.js";

export const notFound = (req, res, next) => {

    const error = new Error(
        `Route not found: ${req.originalUrl}`
    );

    res.status(404);

    next(error);

};

export const errorHandler = (error, req, res, next) => {

    logger.error(error.stack || error.message);

    let statusCode = res.statusCode >= 400
        ? res.statusCode
        : 500;

    let message = error.message || "Internal server error";

    if (error.code === 11000) {

        statusCode = 409;
        message = "Duplicate record already exists";

    }

    if (error.name === "ValidationError") {

        statusCode = 400;
        message = error.message;

    }

    if (error.name === "CastError") {

        statusCode = 400;
        message = "Invalid data format";

    }

    res.status(statusCode).json({
        success: false,
        message
    });

};
