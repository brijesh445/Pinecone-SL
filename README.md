# Pinecone-SL
Pinecone-based Personalized Lighting solution based on e different collected sensors data process it and create personal lighting. 

## Include LWIP MQTT Libray in bouffalo.mk file

by default the lwip-MQTT library is not included in bouffalo.mk, To do this move to "bl_iot_sdk\components\network\lwip" file open bouffalo.mk file and the line "src/apps/mqtt" at the end of line in "COMPONENT_SRCDIRS" Variable.

Before
```bash
  COMPONENT_SRCDIRS := src/api src/core src/core/ipv4 src/netif lwip-port/FreeRTOS lwip-port src/apps/altcp_tls

```

After
```bash
  COMPONENT_SRCDIRS := src/api src/core src/core/ipv4 src/netif lwip-port/FreeRTOS lwip-port src/apps/altcp_tls src/apps/mqtt

```


## Setup Eclipse Mosquitto Broker


