import time
import json
import network
import machine

from umqtt.simple import MQTTClient

from common.config import (
    POLE_ID,
    LDR_PIN,
    RELAY_PIN,
    RELAY_ACTIVE_LOW,
    DARK_THRESHOLD,
    BRIGHT_THRESHOLD,
    SENSOR_INTERVAL,
    HEARTBEAT_INTERVAL,
    SENSOR_TOPIC,
    STATUS_TOPIC,
    COMMAND_TOPIC,
    ACK_TOPIC
)

from common.secrets import (
    WIFI_SSID,
    WIFI_PASSWORD,
    MQTT_HOST,
    MQTT_PORT,
    MQTT_USERNAME,
    MQTT_PASSWORD
)


# --------------------------------------------------
# HARDWARE INITIALIZATION
# --------------------------------------------------

ldr = machine.ADC(machine.Pin(LDR_PIN))

# ESP32 ADC range: 0 - 4095
ldr.atten(machine.ADC.ATTN_11DB)

relay = machine.Pin(RELAY_PIN, machine.Pin.OUT)


# Current state

light_status = "OFF"
operating_mode = "AUTO"


# --------------------------------------------------
# RELAY CONTROL
# --------------------------------------------------

def set_light(action):

    global light_status

    if action == "ON":

        if RELAY_ACTIVE_LOW:
            relay.value(0)
        else:
            relay.value(1)

        light_status = "ON"

    elif action == "OFF":

        if RELAY_ACTIVE_LOW:
            relay.value(1)
        else:
            relay.value(0)

        light_status = "OFF"

    else:
        return False

    print("Light Status:", light_status)

    return True


# --------------------------------------------------
# LDR SENSOR
# --------------------------------------------------

def read_ldr():

    total = 0

    # Take multiple readings to reduce noise
    for _ in range(10):

        total += ldr.read()

        time.sleep_ms(10)

    average = total // 10

    return average


# --------------------------------------------------
# WIFI CONNECTION
# --------------------------------------------------

def connect_wifi():

    wifi = network.WLAN(network.STA_IF)

    wifi.active(True)

    if wifi.isconnected():

        print("Already connected to Wi-Fi")

        return wifi

    print("Connecting to Wi-Fi...")

    wifi.connect(WIFI_SSID, WIFI_PASSWORD)

    timeout = 20

    while not wifi.isconnected() and timeout > 0:

        print("Waiting for Wi-Fi...")

        time.sleep(1)

        timeout -= 1

    if wifi.isconnected():

        print("Wi-Fi connected")

        print("IP Address:", wifi.ifconfig()[0])

    else:

        print("Wi-Fi connection failed")

        raise RuntimeError("Wi-Fi connection failed")

    return wifi


# --------------------------------------------------
# MQTT ACKNOWLEDGEMENT
# --------------------------------------------------

def send_ack(client, command_id, action, success):

    data = {
        "poleId": POLE_ID,
        "commandId": command_id,
        "action": action,
        "success": success
    }

    payload = json.dumps(data)

    client.publish(ACK_TOPIC, payload)

    print("Acknowledgement sent:", payload)


# --------------------------------------------------
# MQTT COMMAND CALLBACK
# --------------------------------------------------

def mqtt_callback(topic, message):

    global operating_mode

    print("Received Topic:", topic)

    print("Received Message:", message)

    try:

        command = json.loads(message)

        action = command.get("action", "")

        command_id = command.get("commandId", "")

        success = False

        # ON / OFF commands

        if action == "ON":

            success = set_light("ON")

        elif action == "OFF":

            success = set_light("OFF")

        # AUTO / MANUAL mode commands

        elif action == "AUTO":

            operating_mode = "AUTO"

            success = True

        elif action == "MANUAL":

            operating_mode = "MANUAL"

            success = True

        else:

            print("Unknown command:", action)

        # Send acknowledgement

        send_ack(
            mqtt_client,
            command_id,
            action,
            success
        )

        # Send updated status

        publish_status(mqtt_client)

    except Exception as error:

        print("Command processing error:", error)


# --------------------------------------------------
# MQTT CONNECTION
# --------------------------------------------------

def connect_mqtt():

    global mqtt_client

    client_id = "ESP32_" + POLE_ID

    mqtt_client = MQTTClient(
        client_id,
        MQTT_HOST,
        port=MQTT_PORT,
        user=MQTT_USERNAME,
        password=MQTT_PASSWORD,
        keepalive=30
    )

    mqtt_client.set_callback(mqtt_callback)

    mqtt_client.connect()

    mqtt_client.subscribe(COMMAND_TOPIC)

    print("MQTT connected")

    print("Subscribed:", COMMAND_TOPIC)

    return mqtt_client


# --------------------------------------------------
# SEND SENSOR DATA
# --------------------------------------------------

def publish_sensor_data(client):

    reading = read_ldr()

    data = {
        "poleId": POLE_ID,
        "ldrReading": reading,
        "lightStatus": light_status,
        "mode": operating_mode
    }

    payload = json.dumps(data)

    client.publish(SENSOR_TOPIC, payload)

    print("Sensor Data:", payload)


# --------------------------------------------------
# SEND POLE STATUS
# --------------------------------------------------

def publish_status(client):

    data = {
        "poleId": POLE_ID,
        "lightStatus": light_status,
        "mode": operating_mode
    }

    payload = json.dumps(data)

    client.publish(STATUS_TOPIC, payload)

    print("Pole Status:", payload)


# --------------------------------------------------
# MAIN PROGRAM
# --------------------------------------------------

def main():

    global mqtt_client

    connect_wifi()

    mqtt_client = connect_mqtt()

    last_sensor_time = time.ticks_ms()

    last_heartbeat_time = time.ticks_ms()

    publish_status(mqtt_client)

    print("Smart Streetlight Controller Started")

    while True:

        try:

            # Listen for incoming commands

            mqtt_client.check_msg()

            current_time = time.ticks_ms()

            # Send sensor data periodically

            if time.ticks_diff(
                current_time,
                last_sensor_time
            ) >= SENSOR_INTERVAL:

                last_sensor_time = current_time

                publish_sensor_data(mqtt_client)

            # Send heartbeat periodically

            if time.ticks_diff(
                current_time,
                last_heartbeat_time
            ) >= HEARTBEAT_INTERVAL:

                last_heartbeat_time = current_time

                publish_status(mqtt_client)

            time.sleep_ms(100)

        except Exception as error:

            print("Connection error:", error)

            print("Reconnecting MQTT...")

            time.sleep(3)

            try:

                mqtt_client = connect_mqtt()

            except Exception as reconnect_error:

                print("MQTT reconnect failed:", reconnect_error)

                time.sleep(5)


# --------------------------------------------------
# START
# --------------------------------------------------

main()