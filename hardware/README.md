# Adaptive Smart Street Lighting System

## Hardware Controller

This folder contains the MicroPython-based ESP32 controller
for the Adaptive Smart Street Lighting System.

## Folder Structure

hardware/
├── circuit_diagrams/
├── common/
│   ├── config.py
│   └── secrets.py
├── pole_controller/
│   └── pole_controller.py
└── README.md

## Features

- LDR-based light intensity monitoring
- MQTT communication
- Remote ON/OFF control
- AUTO and MANUAL modes
- Pole status monitoring
- Heartbeat communication
- Command acknowledgement

## Requirements

- ESP32 Development Board
- MicroPython firmware
- LDR sensor
- Relay module
- Wi-Fi connection
- MQTT broker

## Installation

1. Install MicroPython firmware on ESP32.
2. Copy the common folder to ESP32.
3. Copy pole_controller.py to ESP32.
4. Configure Wi-Fi and MQTT credentials in secrets.py.
5. Configure the pole ID in config.py.
6. Run pole_controller.py.

## MQTT Topics

Sensor:
streetlight/POLE_001/sensor

Status:
streetlight/POLE_001/status

Command:
streetlight/POLE_001/command

Acknowledgement:
streetlight/POLE_001/ack

## Note

MQTT broker and MongoDB backend must be configured separately
for cloud data storage and dashboard control.