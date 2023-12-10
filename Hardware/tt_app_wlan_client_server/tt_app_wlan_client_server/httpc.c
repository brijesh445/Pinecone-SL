#include "wifi.h"

#if WIFI_MODE_PINECONE == WIFI_MODE_STA

#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include <FreeRTOS.h>
#include <task.h>

#include <http_client.h>
#include <cJSON.h>

#include <lwip/sockets.h>
#include <lwip/netdb.h>
#include <lwip/tcp.h>
#include <lwip/err.h>


#include "lwip/apps/mqtt_opts.h"
#include "lwip/pbuf.h"
#include "lwip/apps/mqtt.h"
#include "lwip/apps/mqtt_priv.h"
#include "lwip/netif.h"

#define MAXBUF          512
#define BUFFER_SIZE     (12*1024)
#define PORT 3000
// Define MQTT broker information
 // Replace with your MQTT broker's IP address
#define MQTT_BROKER_PORT 1883


static struct mqtt_client_s mqtt_client;


static void example_do_connect(mqtt_client_t *client);
static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);


/**MQTT IMPLIMENTATION*/


/* Called when publish is complete either with sucess or failure */
static void mqtt_pub_request_cb(void *arg, err_t result)
{
  if(result != ERR_OK) {
    printf("Publish result: %d\n", result);
 
  }
}




static int inpub_id;
static void mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len)
{
  printf("Incoming publish at topic %s with total length %u\n", topic, (unsigned int)tot_len);

  /* Decode topic string into a user defined reference */
  if(strcmp(topic, "temprature") == 0) {
    inpub_id = 0;
  } else if(topic[0] == 'A') {
    /* All topics starting with 'A' might be handled at the same way */
    inpub_id = 1;
  } else {
    /* For all other topics */
    inpub_id = 2;
  }
}

static void mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags)
{
  printf("Incoming publish payload with length %d, flags %u\n", len, (unsigned int)flags);

  printf("mqtt_incoming_data_cb: %s\n", (const char *)data);
  if(flags & MQTT_DATA_FLAG_LAST) {
    /* Last fragment of payload received (or whole part if payload fits receive buffer
       See MQTT_VAR_HEADER_BUFFER_LEN)  */

    /* Call function or do action depending on reference, in this case inpub_id */
    if(inpub_id == 0) {
      /* Don't trust the publisher, check zero termination */
      if(data[len-1] == 0) {
        printf("mqtt_incoming_data_cb: %s\n", (const char *)data);
      }
    } else if(inpub_id == 1) {
      /* Call an 'A' function... */
    
    } else {
      printf("mqtt_incoming_data_cb: Ignoring payload...\n");
    }
  } else {
    /* Handle fragmented payload, store in buffer, write to file or whatever */
  }
}


static void mqtt_sub_request_cb(void *arg, err_t result)
{
  /* Just print the result code here for simplicity, 
     normal behaviour would be to take some action if subscribe fails like 
     notifying user, retry subscribe or disconnect from server */
  printf("Subscribe result: %d\n", result);
}

void example_publish(mqtt_client_t *client, void *arg)
{
  const char *pub_payload= "PubSubHubLubJub";
  err_t err;
  u8_t qos = 2; /* 0 1 or 2, see MQTT specification */
  u8_t retain = 0; /* No don't retain such crappy payload... */
  err = mqtt_publish(client, "temprature", pub_payload, strlen(pub_payload), qos, retain, mqtt_pub_request_cb, arg);
  if(err != ERR_OK) {
    printf("Publish err: %d\n", err);
  }
}

static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status)
{
    err_t err;
    if (status == MQTT_CONNECT_ACCEPTED)
    {
        printf("mqtt_connection_cb: Successfully connected\n");
        //example_publish(client,arg);
        mqtt_set_inpub_callback(client, mqtt_incoming_publish_cb, mqtt_incoming_data_cb, arg);

         err = mqtt_subscribe(client, "temprature", 1, mqtt_sub_request_cb, arg);
           if(err != ERR_OK) {
                  printf("mqtt_subscribe return: %d\n", err);
           }
   
    }
    else
    {
        printf("mqtt_connection_cb: Disconnected, reason: %d\n", status);

        // Reconnect on disconnect
        example_do_connect(client);
    }
}


static void example_do_connect(mqtt_client_t *client)
{

     struct mqtt_connect_client_info_t ci;
    err_t err;

    memset(&ci, 0, sizeof(ci));
    ci.client_id = "lwip_connect";

    ip_addr_t broker_ip;
    //  54.146.113.169
    IP_ADDR4(&broker_ip, 192, 168, 0, 104);

    err = mqtt_client_connect(client,&broker_ip, MQTT_BROKER_PORT, mqtt_connection_cb, 0, &ci);

    if (err != ERR_OK)
    {
        printf("mqtt_connect return %d\n", err);
    }
}



/* http task */


void task_http(void *pvParameters)
{
    while (1)
    {
    
    // Connect to the MQTT broker
        example_do_connect(&mqtt_client);
        vTaskDelay(1 * 1 * 1000);
    }
    
    printf("Deleting task - should not happen\r\n");
    vTaskDelete(NULL);
}
#endif
