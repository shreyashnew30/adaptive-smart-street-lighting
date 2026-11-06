# Smart Streetlight Circuit Diagram

## Components

- ESP32 Development Board
- LDR Sensor
- 10K Ohm Resistor
- Relay Module
- LED for testing
- Breadboard
- Jumper Wires

## LDR Connection

LDR and 10K resistor are connected as a voltage divider.

LDR side:
- One terminal of LDR -> 3.3V
- Other terminal of LDR -> GPIO 34
- 10K resistor between GPIO 34 and GND

## Relay Connection

- Relay IN -> GPIO 26
- Relay GND -> ESP32 GND
- Relay VCC -> According to relay module specification

## Safety

Test using a low-voltage LED first.

Do not connect household AC mains or an actual streetlight
directly to the ESP32 or relay module without a qualified
electrician.