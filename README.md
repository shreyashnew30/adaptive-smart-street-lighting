# 💡 Adaptive Smart Street Lighting System

An IoT-Based Smart Street Lighting System Using LDR Sensors, ESP32, MQTT, and Cloud Monitoring.

## 📌 Project Overview

The **Adaptive Smart Street Lighting System** is an IoT-based project designed to make traditional street lighting more intelligent, energy-efficient, and remotely manageable.

The system uses Light Dependent Resistor (LDR) sensors to monitor surrounding light intensity and an ESP32-based controller to communicate sensor readings to a backend server through MQTT.

The backend processes sensor data, manages individual streetlight poles, and enables remote monitoring and control through a web-based dashboard.

The system supports automatic and manual operating modes, allowing streetlights to respond to environmental conditions as well as administrator commands.

## 🎯 Objectives

- Reduce unnecessary electricity consumption.
- Automate streetlight operation based on ambient light intensity.
- Monitor individual streetlight poles remotely.
- Provide centralized control of multiple streetlight poles.
- Store sensor readings for historical analysis.
- Display real-time pole status through a web dashboard.
- Improve streetlight management using IoT and cloud-based communication.

## ✨ Key Features

### 1. Intelligent Lighting Automation
- Uses LDR sensors to measure ambient light intensity.
- Automatically determines streetlight operation based on configured thresholds.
- Supports hysteresis to prevent frequent switching near threshold values.

### 2. Remote Pole Monitoring
- Monitor individual streetlight poles.
- View sensor readings and light status.
- Track pole connectivity and last-seen information.

### 3. Manual and Automatic Control
- AUTO mode for automatic operation.
- MANUAL mode for administrator-controlled operation.
- Individual pole ON/OFF commands.
- Centralized control through the dashboard.

### 4. Cloud-Based Data Management
- MQTT-based communication between hardware and backend.
- MongoDB-based sensor data storage.
- Historical sensor data monitoring.
- Command acknowledgement and pole status tracking.

### 5. Analytics Dashboard
- Total number of poles.
- Active and inactive poles.
- Online and offline pole monitoring.
- Automatic and manual mode statistics.
- Historical sensor readings and analytics.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Hardware Controller | ESP32 |
| Hardware Programming | MicroPython |
| Sensor | LDR |
| Communication Protocol | MQTT |
| Data Format | JSON |
| Authentication | JWT |
| Password Security | bcrypt |
| Development Tools | VS Code, Arduino/Thonny IDE |

## 🏗️ System Architecture

```text
             ENVIRONMENT
                  |
                  v
             LDR SENSOR
                  |
                  v
             ESP32 BOARD
             (MicroPython)
                  |
                  |
             MQTT Protocol
                  |
                  v
             MQTT BROKER
                  |
                  v
          NODE.JS BACKEND
                  |
          +-------+-------+
          |               |
          v               v
       MongoDB        Automation
       Database        Service
          |               |
          |               v
          |          MQTT Commands
          |               |
          |               v
          |             ESP32
          |               |
          |               v
          |             RELAY
          |               |
          |               v
          |          STREETLIGHT
          |
          v
       FRONTEND
      DASHBOARD
```

## 📁 Project Structure

```text
adaptive-smart-street-lighting/
│
├── frontend/
│   ├── index.html
│   ├── poles.html
│   ├── analytics.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── hardware/
│   ├── circuit_diagrams/
│   ├── common/
│   ├── pole_controller/
│   └── README.md
│
├── simulation/
│   ├── mockPoleData.json
│   └── sensorSimulator.js
│
├── .gitignore
└── README.md
```

## 🔌 Hardware Components

The proposed hardware setup includes:

- ESP32 Development Board
- LDR (Light Dependent Resistor)
- 10K Ohm Resistor
- Relay Module
- LED or low-voltage lighting load for demonstration
- Breadboard
- Jumper Wires
- Wi-Fi Connectivity

### Hardware Connections

| Component | ESP32 Pin |
|---|---|
| LDR Output | GPIO 34 |
| Relay Input | GPIO 26 |
| Relay GND | GND |
| Relay VCC | As specified by module |

**Note:** Actual LDR readings and relay polarity must be calibrated according to the hardware circuit. Electrical mains connections require qualified supervision.

## 🔄 Working Principle

1. The LDR sensor measures the surrounding light intensity.
2. ESP32 reads the sensor values.
3. Sensor readings are transmitted to the backend through MQTT.
4. The backend stores sensor data in MongoDB.
5. The automation service determines the required streetlight state.
6. Commands are transmitted to the corresponding ESP32 controller.
7. ESP32 operates the relay according to the received command.
8. The controller sends an acknowledgement to the backend.
9. The dashboard displays pole status and historical information.

## ☁️ MQTT Communication

The system uses MQTT topics for communication between ESP32 controllers and the backend.

Example topics:

| Topic | Purpose |
|---|---|
| `streetlight/POLE_001/sensor` | Sensor readings |
| `streetlight/POLE_001/status` | Pole status and heartbeat |
| `streetlight/POLE_001/command` | Remote control commands |
| `streetlight/POLE_001/ack` | Command acknowledgements |

Each streetlight pole has a unique identifier.

Example sensor payload:

```json
{
  "poleId": "POLE_001",
  "ldrReading": 250,
  "lightStatus": "OFF",
  "mode": "AUTO"
}
```

## 🚀 Installation and Setup

### Prerequisites

Install the following software:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git
- Python / MicroPython
- Thonny IDE for ESP32 MicroPython development

An MQTT broker is also required for hardware communication.

### 1. Clone the Repository

```bash
git clone https://github.com/shreyashnew30/adaptive-smart-street-lighting.git
```

Navigate to the project directory:

```bash
cd adaptive-smart-street-lighting
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure the `.env` file using `.env.example`.

Required configuration includes:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret

MQTT_URL=your_mqtt_broker_url
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password

LDR_DARK_THRESHOLD=300
LDR_BRIGHT_THRESHOLD=500
```

Start the backend:

```bash
npm run dev
```

Backend health endpoint:

```text
http://localhost:5000/api/health
```

### 3. Frontend Setup

Open the frontend folder using VS Code.

Run the frontend using the VS Code Live Server extension.

Alternatively, use any local static web server.

### 4. Hardware Setup

1. Install MicroPython firmware on the ESP32.
2. Configure Wi-Fi and MQTT credentials.
3. Configure the unique pole ID.
4. Upload the hardware Python files to ESP32.
5. Connect the LDR sensor and relay module.
6. Connect the ESP32 to the configured MQTT broker.

## 📊 Operating Modes

| Mode | Description |
|---|---|
| AUTO | Lighting decisions are made automatically based on sensor readings and configured thresholds. |
| MANUAL | Administrator can control individual streetlights remotely. |

## 🔐 Security

The backend includes:

- JWT-based authentication.
- Password hashing using bcrypt.
- Protected API routes.
- Role-based administrator access.

Sensitive credentials such as database URLs, JWT secrets, Wi-Fi passwords, and MQTT credentials must be stored in environment or local secret files and must never be committed to GitHub.

## 🔮 Future Enhancements

- GPS-based streetlight pole mapping.
- Advanced energy consumption monitoring.
- Power usage analytics.
- Mobile application integration.
- Fault detection and predictive maintenance.
- Solar-powered streetlight integration.
- More advanced adaptive lighting algorithms.
- Support for additional environmental sensors.

## 🎓 Project Information

**Project Title:** Adaptive Smart Street Lighting System Using LDR and Cloud Monitoring

**Project Domain:** Internet of Things (IoT), Embedded Systems, Cloud Computing, and Web Development

**Project Type:** Academic / Engineering Project

## 👨‍💻 Author

**Shreyash**

GitHub: [@shreyashnew30](https://github.com/shreyashnew30)

---

## 📜 License

This project is developed for educational and academic purposes.

A formal open-source license can be added to the repository separately.
