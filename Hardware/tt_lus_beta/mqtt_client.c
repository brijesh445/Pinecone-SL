#include "wifi.h"

#include <stdio.h>
#include <stdint.h>
#include <string.h>

#include <FreeRTOS.h>
#include <task.h>

#include <http_client.h>
#include <cJSON.h>
/*
  The Light-weight IP library has been included in the BL602 SDK
  LwIP implements a resource-considerate MQTT client using TCP Sockets
 */
#include <lwip/sockets.h>
#include <lwip/netdb.h>
#include <lwip/tcp.h>
#include <lwip/err.h>
#include <bl_gpio.h>

#include "lwip/altcp.h"
#include "lwip/altcp_tcp.h"
#include "lwip/altcp_tls.h"

#include "lwip/apps/mqtt_opts.h" //Configuring the size of the MQTT messsage buffer
#include "lwip/pbuf.h"
#include "lwip/apps/mqtt.h"
#include "lwip/apps/mqtt_priv.h"
#include "lwip/netif.h"

// Define MQTT broker information
// Replace with your MQTT broker's IP address
#define MAXBUF          512
#define BUFFER_SIZE     (12*1024)
#define PORT 3000
#define MQTT_BROKER_PORT 1883

// Define the GPIO pins for the various sensors and actuators
#define DHT 2 // Temperature and Humidity sensor
#define PIR 5 // Motion sensor
#define TSL 12 // Luminosity Measurement sensor
#define RLY 4 // Relay controlling the Power source
#define LED 14 // Internal LED indicators


static struct mqtt_client_s mqtt_client;
static void example_do_connect(mqtt_client_t *client);
static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
static void auto_mode();


/**MQTT IMPLIMENTATION*/
static void sensor_init()
{
  bl_gpio_enable_input(TSL,0,0);
  bl_gpio_enable_input(PIR,0,0); //GPIO pin for PIR
  bl_gpio_enable_output(RLY,0,0);
  bl_gpio_enable_output(LED,0,0);
  //bl_gpio_enable_output(11,0,0);
  vTaskDelay(3* 1 * 1000);
  bl_gpio_output_set(LED,1);
  bl_gpio_output_set(RLY,0);
}

/* Called when publish is complete either with sucess or failure */
static void mqtt_pub_request_cb(void *arg, err_t result)
{
  if(result != ERR_OK) {
    printf("Publish result: %d\r\n", result);
 
  }
}

// Every incoming message/device is assigned an ID
static int inpub_id;
static void mqtt_incoming_publish_cb(void *arg, const char *topic, u32_t tot_len)
{
  printf("Incoming publish at topic %s with total length %u\r\n", topic, (unsigned int)tot_len);

  /* Decode topic string into a user defined reference */
  if(strcmp(topic, "publish-led-status") == 0) {
    inpub_id = 1;
  } else if(topic[0] == 'D') {
    /* Just a test topic used for debugging */
    inpub_id = 0;
  } else {
    /* For all other topics */
    inpub_id = 2;
  }
}

char status_old[5] = "0";
char status_new[5];
int change;
static char response[MAXBUF];
// the MQTT subscription messages are processed in this method
static void mqtt_incoming_data_cb(void *arg, const u8_t *data, u16_t len, u8_t flags)
{ 
  strcpy(response, (const char*)data);
  strcpy(status_new, (const char*)data);
  
  printf("%s, %s\r\n",status_old,status_new);
  
  change = strcmp(status_old,status_new);
  
  if(change != 0){
    strcpy(status_old, status_new);
  }
  
  printf("%s\r\n",status_old);
  
  if(strcmp(response, "2")==0)
  {
    auto_mode();
  }
  else if(strcmp(response, "1")==0){
    bl_gpio_output_set(RLY,0);
    //auto_mode("OFF");
  }
  else if(strcmp(response, "0")==0){
    //auto_mode("OFF");
    bl_gpio_output_set(RLY,1);
    //auto_mode("OFF");
  }
  else{
    //auto_mode("OFF"); 
  }
 
  printf("mqtt_data: %s\r\n", (const char *)data);
  
  //printf("response: %s\r\n", response);
  if(flags & MQTT_DATA_FLAG_LAST) {
    /* Call function or do action depending on reference, in this case inpub_id */
    if(inpub_id == 0) {
      /* Don't trust the publisher, check zero termination */
      if(data[len-1] == 0) {
      //printf("mqtt_-1: %s\r\n", (const char *)data);
      }
    } else if(inpub_id == 1) {
      /* Trusted publisher, can recieve messages and execute functions */
    } else {
     //printf("mqtt_incoming_data_cb: Ignoring payload...\r\n");
    }
  } else {
    /* Handle fragmented payload, store in buffer, write to file or handle it in other ways */
  }
}


static void mqtt_sub_request_cb(void *arg, err_t result)
{
  /* Just print the result code here for simplicity, 
     normal behaviour would be to take some action if subscribe fails like 
     notifying user, retry subscribe or disconnect from server */
  printf("Subscribe result: %d\r\n", result);
}

char pub_payload[400];
// Publish the sensor data from the device to the MQTT server
void example_publish(mqtt_client_t *client, void *arg)
{   int lig = bl_gpio_input_get_value(RLY);
    printf("%d\r\n",lig);
    int motion = bl_gpio_input_get_value(PIR);
    int lux = bl_gpio_input_get_value(TSL);
    int temp = read_dht22();
    sprintf(pub_payload, "{\"device_id\":\"bl602_alpha\",\"device_name\":\"iot_sensor_123\",\"place_id\":\"defaultplace\",\"date\":\"2024-01-22T3:47:42.\",\"timestamp\":\"1234567890\",\"payload\":{\"temperature\":%d,\"humidity\":32,\"led_status\": %d,\"luminosity\": %d,\"proximity\":%d}}",  lig, lux, motion, temp);
  //pub_payload= "";
  err_t err;
  u8_t qos = 2; /* 0 1 or 2, see MQTT specification */
  u8_t retain = 0; /* To determine whether we need to store the message or not*/
  err = mqtt_publish(client, "live-sensor-readings", pub_payload, strlen(pub_payload), qos, retain, mqtt_pub_request_cb, arg);
  if(err != ERR_OK) {
    printf("Publish err: %d\r\n", err);
  }
}

void auto_mode() // Control logic for Light based on the Motion and Luminosity values in the room
{ 
  int ctr = 0;
  if(strcmp(status_new, "2")==0 && change !=0){
  for(;ctr<100;ctr++)
  { 
    printf("%s", status_new);
    ctr++;
    printf("ON\r\n");
    int motion = bl_gpio_input_get_value(PIR);
    int lux = bl_gpio_input_get_value(TSL); // it is a trigger value from the other controller with the TSL
    printf("Current Motion and Light signal: %d %d\r\n", motion, lux);
    if(motion == 1 || lux == 0){
       bl_gpio_output_set(RLY,1);
    }
    else{
       bl_gpio_output_set(RLY,0);
    }
    vTaskDelay(1* 1 * 1000);
  }
  }
  
  /*  // Auto Cut-off for the Light, to save energy
  if(ctr == 500)
  {
  break;}
  
  else if(strcmp(str,"OFF")==0 || strcmp(status, "OFF")==0)
  {
    printf("OFF\r\n");
    bl_gpio_output_set(LED,0);
  }
  */
  //}
}

/* Callback method which monitors the device connection to the MQTT Broker */
static void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status)
{
    err_t err;
    
    if (status == MQTT_CONNECT_ACCEPTED)
    {
        printf("mqtt_connection_cb: Successfully connected\r\n");
        mqtt_set_inpub_callback(client, mqtt_incoming_publish_cb, mqtt_incoming_data_cb, arg);
         err = mqtt_subscribe(client, "publish-led-status", 2, mqtt_sub_request_cb, arg);
         //living_room/light
         //example_publish(client,arg);
           if(err != ERR_OK) {
                  printf("mqtt_subscribe return: %d\r\n", err);
           }
   
    }
    else
    {
        printf("mqtt_connection_cb: Disconnected, reason: %d\r\n", status);

        // Reconnect on disconnect
        example_do_connect(client);
    }
}

/* The constant connection to the MQTT host as long as the device is powered */
static void example_do_connect(mqtt_client_t *client)
{

    struct mqtt_connect_client_info_t ci;
    err_t err;

    memset(&ci, 0, sizeof(ci));
    ci.client_id = "bl602_alpha";

    ip_addr_t broker_ip;
    //  54.146.113.169
    //IP_ADDR4(&broker_ip, 192, 168, 0, 100);
    IP_ADDR4(&broker_ip, 192, 168, 175, 16);

    err = mqtt_client_connect(client,&broker_ip, MQTT_BROKER_PORT, mqtt_connection_cb, 0, &ci); //callback to the broker
    
    if (err != ERR_OK)
    {
        printf("mqtt_connect return %d\r\n", err);
        example_publish(client,mqtt_pub_request_cb);
    }
}



/* mqtt task */
void task_mqtt(void *pvParameters)
{
    sensor_init();
    while (1)
    {
    // Connect to the MQTT broker
        example_do_connect(&mqtt_client);
        vTaskDelay(3* 1 * 1000);
    }
    
    printf("Deleting task - should not happen\r\n");
    vTaskDelete(NULL);
}
