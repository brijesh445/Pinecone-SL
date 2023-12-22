const mqtt = require('mqtt');
require('dotenv').config();

// MQTT broker
const mqtt_broker = process.env.MQTT_BROKER;
const mqtt_topic = process.env.MQTT_TOPIC;
const mqtt_pub_interval = process.env.MQTT_PUB_INTERVAL;
// device specific details
// const device_name = process.env.DEVICE_NAME;
// const device_id = process.env.DEVICE_ID;
// const place_id = process.env.PLACE_ID;

// Create a client instance
const client = mqtt.connect(mqtt_broker);

const getRandomNumber = (min, max, floorFlag = true) => {
    if (floorFlag) {
        return Math.floor(Math.random() * (max - min) + min);
    } else {
        return Math.random() * (max - min) + min;
    }
}

// Data to be published
const fetch_payload = () => {
    const device_id = getRandomNumber(1, 4, true);
    const placeList = ["Kitchen", "Living Room", "Bed Room"];
    const date = new Date();
    return {
        "device_id": device_id,
        "device_name": `iot_sensor_${device_id}`,
        "place_id": placeList[device_id - 1],
        "date": date.toISOString(), // 2023-11-06T19:47:42.440Z
        "timestamp": date.getTime(), // number in ns
        "payload": {
            "temperature_sensor_reading": getRandomNumber(-10, 30, true),
            "led_status_reading": getRandomNumber(-10, 10, true) > 0 ? true : false,
            "luminosity_reading": Number(getRandomNumber(0, 1, false).toFixed(2)),
            "proximity_sensor_reading": getRandomNumber(25, 2000, true),
            "light_sensor_reading": getRandomNumber(0, 1023, true),
        }
    }
}

// Function to publish data
const publishData = async () => {
    const payload = fetch_payload();
    const jsonMessage = JSON.stringify(payload);
    client.publish(mqtt_topic, jsonMessage, (err) => {
        if (err) {
            console.error('Error occurred:', err);
        } else {
            console.log('Published:', jsonMessage);
        }
    });
}

// When the client is connected
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    // Publish data every set interval
    setInterval(publishData, mqtt_pub_interval);
});

// Handle errors
client.on('error', (error) => {
    console.error('Error:', error);
});

// Close the connection on script termination
const signalHandler = (signal) => {
    // do some stuff here
    client.end();
    console.log('Disconnected from MQTT broker');
    process.exit();
}

process.on('SIGINT', signalHandler)
process.on('SIGTERM', signalHandler)
process.on('SIGQUIT', signalHandler)