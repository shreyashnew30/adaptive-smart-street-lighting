
export const getAutomaticLightStatus = (
    reading,
    currentStatus,
    darkThreshold = 300,
    brightThreshold = 500
) => {

    if (
        !Number.isFinite(reading) ||
        reading < 0 ||
        !Number.isFinite(darkThreshold) ||
        !Number.isFinite(brightThreshold) ||
        darkThreshold >= brightThreshold
    ) {
        throw new Error("Invalid sensor reading or threshold");
    }

    if (reading < darkThreshold) {
        return "ON";
    }

    if (reading > brightThreshold) {
        return "OFF";
    }

    return currentStatus;

};
