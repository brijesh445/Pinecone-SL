// FreeRTOS
#include <FreeRTOS.h>
#include <task.h>

// Input/output
#include <stdio.h>
#include <stdint.h>
#include <bl_uart.h>   
// GPIO library
#include <bl_gpio.h>
//GPIO pin connected to DHT22
#define DHT_PIN 17

void read_dht22_data() {
  //bl_gpio_enable_output(DHT_PIN, 0, 0);
  uint8_t data[5] = {0};
  //set as output and write interupt to DHT22
  bl_gpio_output_set(DHT_PIN, 0);
  vTaskDelay(1 / portTICK_PERIOD_MS);
  bl_gpio_output_set(DHT_PIN, 1);
  BL602_Delay_US(30);
  //Change to input mode
  bl_gpio_enable_input(DHT_PIN, 0, 0);
  
  //read alternating reponses of low/high for 80us
  while(bl_gpio_input_get_value(DHT_PIN) == 1);
  while(bl_gpio_input_get_value(DHT_PIN) == 0);
  while(bl_gpio_input_get_value(DHT_PIN) == 1);
  
  //Read 40 data bits
  for(int i=0; i < 40; i++) {
    while(bl_gpio_input_get_value(DHT_PIN) == 0);  //initial bit
    BL602_Delay_US(30);
    /*
      The DHT22 sensor returns 40 bits of data carrying the following information,
      humidity -> 16 bits binary data
      temperature -> 16 bits binary reresentation of temperature 
      checksum -> 8 bit checksum to maintain integrity and detect corruption of the DHT22 readings
    */
    if(bl_gpio_input_get_value(DHT_PIN)){
      data[i/8] |= (1 << (7-(i%8)));  //
    }
    
    while(bl_gpio_input_get_value(DHT_PIN) == 1);
  }
  
  uint16_t humidity = (data[0]<<8)|data[1];
  uint16_t temperature = (data[2]<<8)|data[3];
  uint8_t check = data[4];
  
  printf("Humidity: %d.%d percent\r\n", humidity/10, humidity%10);
  printf("Temperature: %d.%d C\r\n", temperature/10, temperature%10);
}

