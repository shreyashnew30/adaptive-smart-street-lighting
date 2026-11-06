
document.addEventListener("DOMContentLoaded", async () => {

    const canvas = App.getElement("ldrChart");

    const rangeSelect = App.getElement("chartRange");

    let analyticsData = null;

    function drawChart(readings) {

        if (!canvas || !readings.length) return;

        const context = canvas.getContext("2d");

        const rect = canvas.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;

        context.scale(pixelRatio, pixelRatio);

        const padding = {
            top: 20,
            right: 20,
            bottom: 45,
            left: 45
        };

        const chartWidth =
            width - padding.left - padding.right;

        const chartHeight =
            height - padding.top - padding.bottom;

        const values = readings.map(item => item.value);

        const maxValue = Math.max(1000, ...values);

        const stepX = chartWidth / Math.max(1, readings.length - 1);

        context.clearRect(0, 0, width, height);

        // Horizontal grid lines.

        context.strokeStyle = "#e5e9f0";
        context.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {

            const y = padding.top + (chartHeight / 4) * i;

            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(width - padding.right, y);
            context.stroke();

            context.fillStyle = "#718096";
            context.font = "10px Inter";

            context.fillText(
                Math.round(maxValue - (maxValue / 4) * i),
                5,
                y + 3
            );

        }

        // Draw sensor line.

        context.beginPath();

        readings.forEach((item, index) => {

            const x = padding.left + index * stepX;

            const y =
                padding.top +
                chartHeight -
                (item.value / maxValue) * chartHeight;

            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }

        });

        context.strokeStyle = "#2563eb";
        context.lineWidth = 2.5;
        context.lineJoin = "round";
        context.stroke();

        // Draw points and X-axis labels.

        readings.forEach((item, index) => {

            const x = padding.left + index * stepX;

            const y =
                padding.top +
                chartHeight -
                (item.value / maxValue) * chartHeight;

            context.beginPath();
            context.arc(x, y, 3.5, 0, Math.PI * 2);

            context.fillStyle = "#2563eb";
            context.fill();

            context.fillStyle = "#718096";
            context.font = "9px Inter";
            context.textAlign = "center";

            context.fillText(
                item.label,
                x,
                height - 15
            );

        });

    }

    function updateDistribution(summary) {

        const total = summary.total || 0;

        const values = [
            summary.active,
            summary.inactive,
            summary.offline
        ];

        const ids = [
            "On",
            "Off",
            "Offline"
        ];

        const progressIds = [
            "progressOn",
            "progressOff",
            "progressOffline"
        ];

        values.forEach((value, index) => {

            App.setText(`distribution${ids[index]}`, value);

            const percentage = total > 0
                ? (value / total) * 100
                : 0;

            const progress = App.getElement(progressIds[index]);

            if (progress) {
                progress.style.width = `${percentage}%`;
            }

        });

    }

    function generateInsights(data) {

        const container = App.getElement("systemInsights");

        if (!container) return;

        const summary = data.summary;

        const insights = [];

        insights.push(
            `${summary.active} lights are currently ON out of ${summary.total} registered poles.`
        );

        if (summary.offline > 0) {

            insights.push(
                `${summary.offline} pole(s) are offline and need connectivity inspection.`
            );

        } else {

            insights.push(
                "All registered poles are currently online."
            );

        }

        insights.push(
            `Average LDR sensor reading is ${data.averageLdr}.`
        );

        container.innerHTML = insights.map(text => `

            <div class="insight-item">
                <span>◉</span>
                <p>${text}</p>
            </div>

        `).join("");

    }

    async function loadAnalytics(range = 24) {

        try {

            const data = await API.getAnalytics(range);

            analyticsData = data;

            App.setText("averageLdr", data.averageLdr);

            App.setText(
                "analyticsActive",
                data.summary.active
            );

            App.setText(
                "automaticCount",
                data.summary.automatic ?? "--"
            );

            updateDistribution(data.summary);

            generateInsights(data);

            drawChart(data.readings);

        } catch (error) {

            console.error(error);

            App.showToast(
                "Unable to load analytics",
                "error"
            );

        }

    }

    rangeSelect.addEventListener("change", () => {

        loadAnalytics(Number(rangeSelect.value));

    });

    window.addEventListener("resize", () => {

        if (analyticsData) {
            drawChart(analyticsData.readings);
        }

    });

    await loadAnalytics(24);

});
