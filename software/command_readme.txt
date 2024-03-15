The following are the steps to run the entire application. 

First a broad picture - 
1. "demo" folder code includes the infrastructure code which is related to MQTT, KAFKA and MongoDB data storage
2. "mongo-express" folder code includes list of Express API request which is built for the UI. There are all GET request ONLY.
3. "smart iot UI" folder code includes the React UI which shows list of devices and related chart data and values. This also includes react pub to trigger pinecone via MQTT protocol.


NOW THE COMMANDS - 
1. RUN MONGODB SERVER on PORT 3000 (PORT NUMBER IS IMPORTANT)!!
cd mongo-express 
npm run start

2. RUN REACT UI on PORT 3001 
cd smart iot UI
npm run start

3. MAKE IMPORTANT CHANGES IN THE .env file under demo folder
UPDATE THE IP ADDRESS of the following variables - 
MQTT_BROKER (update IP ADDRESS TO YOUR PRIVATE IP)
MQTT_TOPIC (update the mqtt topic that matches that of the pinecone)
KAFKA_BROKER (update IP ADDRESS TO YOUR PRIVATE IP)
DOCKER_COMMAND_2 (update IP ADDRESS TO YOUR PRIVATE IP)

4. INSTALL DOCKER DESKTOP

5. FIREWALL SETUP
OPEN WINDOWS FIREWALL 
OPEN INBOUND RULES
CREATE NEW RULES and include the following ports - 1883, 1884, 9001, 8080, 8081, 8090, 8091

6. MOSQUITTO INSTALLATION
install mosquitto broker from https://mosquitto.org/download/
open the mosquitto.conf under  "program files/mosquitto" directory
replace that file with the one in the current directory
this makes sure MQTT broker opens and listens to the list of ports
cd into the "program files/mosquitto" directory and run "mosquitto -c mosquitto.conf -v"
YOUR MQTT BROKER IS NOW RUNNING LOCALLY

7. KAFKA INSTALLATION
make sure the .env files is updated as per step 3
make sure docker desktop is up and running
FIRST run the DOCKER_COMMAND_1 from .env file under demo directory
SECOND run the DOCKER_COMMAND_2 from .env file under demo directory
YOUR KAFKA BROKER IS NOW RUNNING LOCALLY

8. RUN INFRASTRUCTURE CODE
cd demo
npm run mqtt-pub
npm run mqtt-sub
npm run kafka-sub



9. RUNNNING DOCKER FILES
cd mongo-express
docker build -t mongo-express .
docker run -p 3000:3000 mongo-express

cd smart iot UI
docker build -t smart-iot-ui .
docker run -p 3001:3001 smart-iot-ui

cd demo
docker build -t demo .
docker run demo
