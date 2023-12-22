# Pinecone-SL
Pinecone-based Personalized Lighting solution based on e different collected sensors data process it and create personal lighting. 


## Including LWIP MQTT Libray in bouffalo.mk file

by default, the lwip-MQTT library is not included in bouffalo.mk, To do this move to "bl_iot_sdk\components\network\lwip" file open bouffalo.mk file and the line "src/apps/mqtt" at the end of line in "COMPONENT_SRCDIRS" Variable.

Before
```bash
  COMPONENT_SRCDIRS := src/api src/core src/core/ipv4 src/netif lwip-port/FreeRTOS lwip-port src/apps/altcp_tls

```

After
```bash
  COMPONENT_SRCDIRS := src/api src/core src/core/ipv4 src/netif lwip-port/FreeRTOS lwip-port src/apps/altcp_tls src/apps/mqtt

```


## Setup Eclipse Mosquitto Broker




Install Mosquitto MQTT Broker

```bash
  https://mosquitto.org/download/
```

Go to installed directory & update mosquitto.conf file.

```bash
  listener 1883 0.0.0.0
  listener 9001
  socket_domain ipv4
  allow_anonymous true
  log_dest stderr
  log_dest file /etc/mosquitto.log
  log_type all
  connection_messages true

```
Open Sockets, to allow Pinecone to connect with MQTT Broker the ports neeeds to be acccessible for the Pinecone.

```bash
  Port : 1883
  Port : 9001
```

Start MQTT Broker from your prefered installed directory by using the below command.

```bash
   mosquitto -c mosquitto.conf -v
```


