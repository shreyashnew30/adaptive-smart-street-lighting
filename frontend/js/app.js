
const App = {

    showToast(message, type = "success") {

        const container = document.getElementById("toastContainer");

        if (!container) return;

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    formatDate(date = new Date()) {

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    },

    formatTime(date = new Date()) {

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    },

    getStatusBadge(status, online = true) {

        if (!online || status === "OFFLINE") {
            return `<span class="status-badge status-offline">● Offline</span>`;
        }

        if (status === "ON") {
            return `<span class="status-badge status-on">● ON</span>`;
        }

        return `<span class="status-badge status-off">● OFF</span>`;
    },

    getModeBadge(mode) {

        return `
            <span class="mode-badge">
                ${mode === "AUTO" ? "Automatic" : "Manual"}
            </span>
        `;
    },

    setText(id, value) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    },

    getElement(id) {

        return document.getElementById(id);
    }

};

window.App = App;


// Display current date on dashboard.

document.addEventListener("DOMContentLoaded", () => {

    const dateElement = document.getElementById("currentDate");

    if (dateElement) {
        dateElement.textContent = App.formatDate();
    }

});
