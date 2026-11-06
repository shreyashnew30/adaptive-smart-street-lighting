
const API = (() => {

    const BASE_URL = "http://localhost:5000/api";

    // Temporary demonstration data.
    // Later this will come from MongoDB through backend APIs.

    let mockPoles = [
        {
            poleId: "POLE-001",
            location: "Main Road - Sector 1",
            ldrReading: 120,
            status: "ON",
            mode: "AUTO",
            online: true
        },
        {
            poleId: "POLE-002",
            location: "Main Road - Sector 2",
            ldrReading: 650,
            status: "OFF",
            mode: "AUTO",
            online: true
        },
        {
            poleId: "POLE-003",
            location: "Park Street",
            ldrReading: 90,
            status: "ON",
            mode: "AUTO",
            online: true
        },
        {
            poleId: "POLE-004",
            location: "College Road",
            ldrReading: 800,
            status: "OFF",
            mode: "MANUAL",
            online: true
        },
        {
            poleId: "POLE-005",
            location: "Market Area",
            ldrReading: 150,
            status: "ON",
            mode: "AUTO",
            online: true
        },
        {
            poleId: "POLE-006",
            location: "Bus Stand",
            ldrReading: 500,
            status: "OFF",
            mode: "AUTO",
            online: true
        },
        {
            poleId: "POLE-007",
            location: "Hospital Road",
            ldrReading: 100,
            status: "ON",
            mode: "AUTO",
            online: true
        },
        {
            poleId: "POLE-008",
            location: "Station Road",
            ldrReading: 300,
            status: "OFF",
            mode: "AUTO",
            online: false
        }
    ];

    let globalMode = "AUTO";

    async function request(endpoint, options = {}) {

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "API request failed");
        }

        return result;
    }

    function getMockPoles() {
        return mockPoles.map(pole => ({ ...pole }));
    }

    function getMockSummary() {

        const total = mockPoles.length;

        const online = mockPoles.filter(p => p.online);

        const active = online.filter(p => p.status === "ON").length;
        const inactive = online.filter(p => p.status === "OFF").length;
        const offline = mockPoles.filter(p => !p.online).length;

        return {
            total,
            active,
            inactive,
            offline,
            globalMode
        };
    }

    async function getPoles() {

        try {
            const data = await request("/poles");

            return Array.isArray(data) ? data : data.data;
        } catch (error) {

            console.warn("Backend unavailable. Using mock data.");

            return getMockPoles();
        }
    }

    async function getDashboard() {

        try {
            return await request("/analytics/summary");
        } catch (error) {

            console.warn("Using demonstration dashboard data.");

            return getMockSummary();
        }
    }

    async function controlPole(poleId, action) {

        const pole = mockPoles.find(p => p.poleId === poleId);

        if (!pole) {
            throw new Error("Pole not found");
        }

        if (!pole.online) {
            throw new Error("This pole is offline");
        }

        if (action !== "ON" && action !== "OFF") {
            throw new Error("Invalid control command");
        }

        try {

            return await request(`/control/${poleId}`, {
                method: "POST",
                body: JSON.stringify({ action })
            });

        } catch (error) {

            // Temporary local simulation.
            pole.status = action;

            return {
                success: true,
                message: `${poleId} switched ${action}`,
                simulated: true
            };
        }
    }

    async function setPoleMode(poleId, mode) {

        if (!["AUTO", "MANUAL"].includes(mode)) {
            throw new Error("Invalid mode");
        }

        try {

            return await request(`/control/${poleId}/mode`, {
                method: "PATCH",
                body: JSON.stringify({ mode })
            });

        } catch (error) {

            const pole = mockPoles.find(p => p.poleId === poleId);

            if (!pole) {
                throw new Error("Pole not found");
            }

            pole.mode = mode;

            return {
                success: true,
                simulated: true
            };
        }
    }

    async function setGlobalMode(mode) {

        if (!["AUTO", "MANUAL"].includes(mode)) {
            throw new Error("Invalid mode");
        }

        try {

            return await request("/control/global-mode", {
                method: "PATCH",
                body: JSON.stringify({ mode })
            });

        } catch (error) {

            globalMode = mode;

            mockPoles.forEach(pole => {
                pole.mode = mode;
            });

            return {
                success: true,
                simulated: true
            };
        }
    }

    async function getAnalytics(range = 24) {

        try {

            return await request(`/analytics?range=${range}`);

        } catch (error) {

            const readings = [];

            for (let i = 0; i < 12; i++) {
                readings.push({
                    label: `${i * 2}:00`,
                    value: Math.floor(100 + Math.random() * 800)
                });
            }

            return {
                readings,
                summary: getMockSummary(),
                averageLdr: Math.round(
                    mockPoles
                        .filter(p => p.online)
                        .reduce((sum, p) => sum + p.ldrReading, 0) /
                    Math.max(1, mockPoles.filter(p => p.online).length)
                )
            };
        }
    }

    return {
        getPoles,
        getDashboard,
        controlPole,
        setPoleMode,
        setGlobalMode,
        getAnalytics,
        getMockPoles
    };

})();

window.API = API;
