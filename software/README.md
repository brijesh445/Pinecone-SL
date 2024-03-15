# IoT Project README

## Overview

This IoT project demonstrates the flow of sensor data from a Pinecone BL602 device to Timestream Database, facilitated by a central system acting as an intermediate gateway. Additionally, it showcases the ability to trigger an actuator connected to the Pinecone BL602 device through MQTT Protocol.

## Project Components

- **Pinecone BL602:** A microcontroller device equipped with sensors and an actuator.
- **Central System:** An intermediary device responsible for bridging communication between Pinecone BL602 and Timeseries database.
- **Eclipse Mosquitto:** Manage transfer of MQTT messaging from node to central system.
- **Apache Kafka:** Distributed event store and stream-processing platform prior database storage operations.
- **Timestream:** A time-series database for storing sensor data.
  
## Project Flow

1. The Pinecone BL602 device collects sensor data and publishes it to an MQTT topic.
2. The central system subscribes to the MQTT topic, receives the sensor data, and passes an aggregate to the Kafka Stream.
3. The sensor data is further processed and stored in a Timestream database for analysis and visualization.
4. When toggled from UI, an MQTT control message is sent to the individual node which triggers an led sensor on the Pinecone BL602 device.

## Project Setup

1. **Make Important Changes in the .env File:**
   - Navigate to the `demo` folder and locate the `.env` file.
   - Update the following variables with your private IP address:
     - `MQTT_BROKER`: Update to your private IP address.
     - `MQTT_TOPIC`: Update to match the MQTT topic of the Pinecone.
     - `KAFKA_BROKER`: Update to your private IP address.
     - `DOCKER_COMMAND_2`: Update to your private IP address.
     - `REACT_APP_MQTT_OVER_WEBSOCKET_URL`: Update the IP address in the `smart iot ui/.env` file.

2. **Run Mosquitto Broker:**
   - Navigate to the "program files/mosquitto" directory.
   - Run the command: `mosquitto -c mosquitto.conf -v`.
   - Your MQTT broker is now running locally.

3. **Run Kafka Broker:**
   - First, execute the `DOCKER_COMMAND_1` from the `.env` file under the `demo` directory.
   - Then, execute the `DOCKER_COMMAND_2` from the `.env` file under the `demo` directory.
   - Your Kafka broker is now running locally.

4. **Run Demo Docker:**
   - Navigate to the `demo` directory.
   - Build the Docker image using the command: `docker build -t demo .`
   - Run the Docker container: `docker run demo`

5. **Run Mongo-Express:**
   - Navigate to the `mongo-express` directory.
   - Build the Docker image using the command: `docker build -t mongo-express .`
   - Run the Docker container: `docker run -p 3000:3000 mongo-express`

6. **Run Smart IoT UI:**
   - Navigate to the `smart iot UI` directory.
   - Build the Docker image using the command: `docker build -t smart-iot-ui .`
   - Run the Docker container: `docker run -p 3001:3001 smart-iot-ui`

## Usage

- Start your Pinecone BL602 device and ensure it's connected to the MQTT broker.
- Run the central system scripts to subscribe to the MQTT topic and pass aggregate data to Kafka pipeline.
- Send actuator control commands from the User Interface to trigger actions on the Pinecone BL602.

## Troubleshooting

- Ensure that your hardware is properly connected and configured.
- Check all user credentials and configurations.
- Verify that the MQTT broker, Kafka pipeline and Timestream are accessible and correctly configured.

## Security

- Secure your MQTT and Kafka communications with encryption and authentication.
- Ensure that system wide credentials are well-protected and not exposed in your code.

## Contributing

Contributions to this project are welcome. If you have ideas for improvements or bug fixes, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to modify this README file to include specific details about your project, including hardware specifications, software setup, and other relevant information. Additionally, you can include a license file (e.g., MIT License) to specify how your project can be used and shared.
