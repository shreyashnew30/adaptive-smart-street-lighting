# Pole Configuration

POLE_ID = "POLE_001"


# ESP32 Pin Configuration

LDR_PIN = 34
RELAY_PIN = 26


# Relay Configuration

# Most relay modules are active LOW.
# Change this to False if your relay is active HIGH.

RELAY_ACTIVE_LOW = True


# LDR Threshold Configuration

# These are example values.
# Calibrate them using actual LDR readings.

DARK_THRESHOLD = 300
BRIGHT_THRESHOLD = 500


# Time Intervals (milliseconds)

SENSOR_INTERVAL = 5000
HEARTBEAT_INTERVAL = 15000


# MQTT Topics

SENSOR_TOPIC = "streetlight/{}/sensor".format(POLE_ID)
STATUS_TOPIC = "streetlight/{}/status".format(POLE_ID)
COMMAND_TOPIC = "streetlight/{}/command".format(POLE_ID)
ACK_TOPIC = "streetlight/{}/ack".format(POLE_ID)