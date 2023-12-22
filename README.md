# Pinecone-SL
Pinecone-based Personalized Lighting solution based on e different collected sensors data process it and create personal lighting. 


## Including LWIP MQTT Libray in bouffalo.mk file

by default, the lwip-MQTT library is not included in bouffalo.mk, To do this move to "bl_iot_sdk\components\network\lwip" Folder open bouffalo.mk file and the line "src/apps/mqtt" at the end of line in "COMPONENT_SRCDIRS" Variable.

Before
```bash
  COMPONENT_SRCDIRS := src/api src/core src/core/ipv4 src/netif lwip-port/FreeRTOS lwip-port src/apps/altcp_tls

```

After
```bash
  COMPONENT_SRCDIRS := src/api src/core src/core/ipv4 src/netif lwip-port/FreeRTOS lwip-port src/apps/altcp_tls src/apps/mqtt

```

## Including Control Flags 

these control flags include altcp_tls_wrap.h which performs the memory allocation for  Application layered TCP connection API.

```bash
CFLAGS += -DLWIP_ALTCP_TLS
CFLAGS += -DLWIP_ALTCP_TLS_MBEDTLS

```


## Increase MQTT Message Buffer Size

by default the MQTT_VAR_HEADER_BUFFER_LEN is set to 128 to set the
 * Number of bytes in receive buffer, must be at least the size of the longest incoming topic + 8
 * If one wants to avoid fragmented incoming publish, set length to max incoming topic length + max payload length + 8
 * this can be easily set by editing the mqtt_opts.h file.

 For more infomation check https://www.nongnu.org/lwip/2_1_x/group__mqtt__opts.html#ga8275ef78a85fb14c3ac1423c70e45805

 ```bash
#ifndef MQTT_VAR_HEADER_BUFFER_LEN
#define MQTT_VAR_HEADER_BUFFER_LEN YOUR_MESSAGE_LENGTH
#endif

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

Subscribe to a topic 

 ```bash
   mosquitto_sub -t YOUR_TOPIC_NAME
```

```bash
   mosquitto_sub -t temprature
```

Publish to a topic 

```bash
   mosquitto_pub -t YOUR_TOPIC_NAME -m "YOUR_MESSAAGE"
```

```bash
   mosquitto_pub -t temprature -m "Hello, MQTT!"
```

