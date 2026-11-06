
import Pole from "../models/Pole.js";
import SensorData from "../models/SensorData.js";

export const getDashboardSummary = async (req, res, next) => {

    try {

        const poles = await Pole.find();

        const total = poles.length;

        const active = poles.filter(
            p => p.online && p.status === "ON"
        ).length;

        const inactive = poles.filter(
            p => p.online && p.status === "OFF"
        ).length;

        const offline = poles.filter(
            p => !p.online
        ).length;

        const automatic = poles.filter(
            p => p.mode === "AUTO"
        ).length;

        const manual = poles.filter(
            p => p.mode === "MANUAL"
        ).length;

        const globalMode = manual > automatic
            ? "MANUAL"
            : "AUTO";

        res.status(200).json({
            total,
            active,
            inactive,
            offline,
            automatic,
            manual,
            globalMode
        });

    } catch (error) {

        next(error);

    }

};

export const getAnalytics = async (req, res, next) => {

    try {

        const range = Number(req.query.range) || 24;

        const validRange = [24, 7].includes(range)
            ? range
            : 24;

        const startDate = new Date();

        if (validRange === 24) {
            startDate.setHours(startDate.getHours() - 24);
        } else {
            startDate.setDate(startDate.getDate() - 7);
        }

        const [poles, records] = await Promise.all([

            Pole.find(),

            SensorData.find({
                recordedAt: {
                    $gte: startDate
                }
            }).sort({ recordedAt: 1 })

        ]);

        const onlinePoles = poles.filter(p => p.online);

        const averageLdr = onlinePoles.length
            ? Math.round(
                onlinePoles.reduce(
                    (sum, pole) => sum + pole.ldrReading,
                    0
                ) / onlinePoles.length
            )
            : 0;

        const total = poles.length;

        const summary = {
            total,

            active: poles.filter(
                p => p.online && p.status === "ON"
            ).length,

            inactive: poles.filter(
                p => p.online && p.status === "OFF"
            ).length,

            offline: poles.filter(
                p => !p.online
            ).length,

            automatic: poles.filter(
                p => p.mode === "AUTO"
            ).length
        };

        // Group readings into hourly averages.
        const groups = new Map();

        records.forEach(record => {

            const date = new Date(record.recordedAt);

            const key = validRange === 24
                ? `${date.getDate()}-${date.getHours()}`
                : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

            if (!groups.has(key)) {
                groups.set(key, {
                    sum: 0,
                    count: 0,
                    date
                });
            }

            const group = groups.get(key);

            group.sum += record.ldrReading;
            group.count++;

        });

        const readings = Array.from(groups.values()).map(group => ({

            label: validRange === 24
                ? group.date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : group.date.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short"
                }),

            value: Math.round(group.sum / group.count)

        }));

        res.status(200).json({
            summary,
            averageLdr,
            readings
        });

    } catch (error) {

        next(error);

    }

};
