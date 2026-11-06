
document.addEventListener("DOMContentLoaded", async () => {

    const refreshDashboard = async () => {

        try {

            const [summary, poles] = await Promise.all([
                API.getDashboard(),
                API.getPoles()
            ]);

            App.setText("totalPoles", summary.total);
            App.setText("activePoles", summary.active);
            App.setText("inactivePoles", summary.inactive);
            App.setText("offlinePoles", summary.offline);

            App.setText("legendOn", summary.active);
            App.setText("legendOff", summary.inactive);
            App.setText("legendOffline", summary.offline);

            App.setText(
                "globalMode",
                summary.globalMode === "MANUAL"
                    ? "Manual"
                    : "Automatic"
            );

            const total = summary.total || 0;

            const percentage = total > 0
                ? Math.round((summary.active / total) * 100)
                : 0;

            App.setText("lightPercentage", `${percentage}%`);

            const onAngle = (summary.active / (total || 1)) * 360;
            const offAngle = (
                (summary.active + summary.inactive) / (total || 1)
            ) * 360;

            const chart = App.getElement("donutChart");

            if (chart) {

                chart.style.background = `
                    conic-gradient(
                        #16a34a 0deg ${onAngle}deg,
                        #ea8b16 ${onAngle}deg ${offAngle}deg,
                        #dc2626 ${offAngle}deg 360deg
                    )
                `;
            }

            renderRecentPoles(poles);

        } catch (error) {

            console.error("Dashboard error:", error);

            App.showToast("Unable to load dashboard", "error");
        }

    };

    function renderRecentPoles(poles) {

        const tbody = App.getElement("recentPolesTable");

        if (!tbody) return;

        const recent = poles.slice(0, 5);

        if (recent.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-cell">
                        No poles found
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = recent.map(pole => `

            <tr>
                <td>
                    <span class="pole-id">${pole.poleId}</span>
                </td>

                <td>${pole.location}</td>

                <td>${pole.ldrReading}</td>

                <td>${App.getModeBadge(pole.mode)}</td>

                <td>
                    ${App.getStatusBadge(pole.status, pole.online)}
                </td>
            </tr>

        `).join("");

    }

    const autoButton = App.getElement("autoModeBtn");
    const manualButton = App.getElement("manualModeBtn");

    if (autoButton) {

        autoButton.addEventListener("click", async () => {

            try {

                await API.setGlobalMode("AUTO");

                App.showToast("Automatic mode activated");

                await refreshDashboard();

            } catch (error) {

                App.showToast(error.message, "error");

            }

        });

    }

    if (manualButton) {

        manualButton.addEventListener("click", async () => {

            try {

                await API.setGlobalMode("MANUAL");

                App.showToast("Manual mode activated");

                await refreshDashboard();

            } catch (error) {

                App.showToast(error.message, "error");

            }

        });

    }

    await refreshDashboard();

    // Refresh dashboard data periodically.

    setInterval(refreshDashboard, 10000);

});
