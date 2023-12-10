#include <stdio.h>

#include <bl_wifi.h>
#include <hal_board.h>
#include <hal_gpio.h>
#include <hal_sys.h>
#include <hal_wifi.h>
#include <hal_uart.h>

#include <aos/yloop.h>
#include <event_device.h>
#include <blog.h>
#include <easyflash.h>
#include <libfdt.h>
#include <looprt.h>
#include <loopset.h>
#include <vfs.h>
#include <wifi_mgmr_ext.h>

#include "wifi.h"

/* read dts */
static int get_dts_addr(const char *name, uint32_t *start, uint32_t *off)
{
  uint32_t addr = hal_board_get_factory_addr();
  const void *fdt = (const void *)addr;
  uint32_t offset;

  if (!name || !start || !off)
  {
    return -1;
  }

  offset = fdt_subnode_offset(fdt, 0, name);
  if (offset <= 0)
  {
    log_error("%s is NULL\r\n", name);
    return -1;
  }

  *start = (uint32_t)fdt;
  *off = offset;

  return 0;
}

/* WiFi configuration */
static wifi_conf_t conf =
    {
        .country_code = "EU",
};

static void _configure_wifi(void)
{
  static int is_initialized = 0;
  if (is_initialized == 0)
  {
    printf("[WIFI] Initialized\r\n");
    wifi_mgmr_start_background(&conf);
    printf("[WIFI] MGMR now running in background\r\n");
    is_initialized = 1;
  }
}

/* start a WiFi access point */
#if WIFI_MODE_PINECONE == WIFI_MODE_AP
static void _start_ap_wifi(void)
{
  /* start access point */
  uint8_t mac[6];
  char ssid_name[32];
  int channel = 6;
  wifi_interface_t wifi_interface;

  memset(mac, 0, sizeof(mac));
  bl_wifi_mac_addr_get(mac);
  memset(ssid_name, 0, sizeof(ssid_name));
  snprintf(ssid_name, sizeof(ssid_name), WIFI_SSID);
  ssid_name[sizeof(ssid_name) - 1] = '\0';

  /* Starting AP */
  printf("[WIFI] Starting up access point\r\n");

  _configure_wifi();
  wifi_interface = wifi_mgmr_ap_enable();

  wifi_mgmr_ap_start(wifi_interface, ssid_name, 0, WIFI_PW, channel);
  printf("[WIFI] Started access point, should be reachable\r\n");
}
#endif

/* connect to a WiFi access point */
#if WIFI_MODE_PINECONE == WIFI_MODE_STA
static void _connect_sta_wifi()
{
  wifi_interface_t wifi_interface = wifi_mgmr_sta_enable();

  wifi_mgmr_sta_connect(wifi_interface, WIFI_SSID, WIFI_PW, NULL, 0, 0, 0);
  printf("[WIFI] Connected to a network\r\n");

  /* Enable automatic reconnect */
  wifi_mgmr_sta_autoconnect_enable();
}
#endif

/* React to WiFi events */
static void event_cb_wifi_event(input_event_t *event, void *private_data)
{
  static char *ssid;
  static char *password;

  switch (event->code)
  {
  case CODE_WIFI_ON_INIT_DONE:
    _configure_wifi();
    break;
  case CODE_WIFI_ON_MGMR_DONE:
    printf("[WIFI] MGMR done\r\n");
#if WIFI_MODE_PINECONE == WIFI_MODE_STA
    /* Connect to a Wifi network*/
    printf("[WIFI] Connecting to a network\r\n");
    _connect_sta_wifi();
#elif WIFI_MODE_PINECONE == WIFI_MODE_AP
    /* Start an access point */
    _start_ap_wifi();
#else
#error "No WiFi mode set"
#endif
    break;
  case CODE_WIFI_ON_SCAN_DONE:
    wifi_mgmr_cli_scanlist();
    break;
  case CODE_WIFI_ON_EMERGENCY_MAC:
    hal_reboot();
    break;
  case CODE_WIFI_ON_PROV_SSID:
    if (ssid)
    {
      vPortFree(ssid);
      ssid = NULL;
    }
    ssid = (char *)event->value;
    break;
  case CODE_WIFI_ON_PROV_BSSID:
    if (event->value)
    {
      vPortFree((void *)event->value);
    }
    break;
  case CODE_WIFI_ON_PROV_PASSWD:
    if (password)
    {
      vPortFree(password);
      password = NULL;
    }
    password = (char *)event->value;
    break;
  case CODE_WIFI_ON_PROV_CONNECT:
#if WIFI_MODE_PINECONE == WIFI_MODE_STA
    _connect_sta_wifi();
#endif
    break;
  case CODE_WIFI_ON_CONNECTING:
    printf("[WIFI] Connecting to a WiFi network\r\n");
    break;
  case CODE_WIFI_ON_CONNECTED:
    printf("[WIFI] Connected to a network\r\n");
    break;
  case CODE_WIFI_ON_GOT_IP:
    printf("[WIFI] Received an IP address\r\n");
    break;
  case CODE_WIFI_ON_SCAN_DONE_ONJOIN:
  case CODE_WIFI_ON_MGMR_DENOISE:
  case CODE_WIFI_ON_DISCONNECT:
  case CODE_WIFI_CMD_RECONNECT:
  case CODE_WIFI_ON_PRE_GOT_IP:
  case CODE_WIFI_ON_PROV_DISCONNECT:
  case CODE_WIFI_ON_AP_STA_ADD:
  case CODE_WIFI_ON_AP_STA_DEL:
    // nothing
    break;
  default:
    printf("[WIFI] Unknown event\r\n");
  }
}

/* WiFi task */
void task_wifi(void *pvParameters)
{
  //  int fd_console;
  uint32_t fdt = 0, offset = 0;
  static StackType_t task_looprt_stack[512];
  static StaticTask_t task_looprt_task;

  /* init bloop */
  looprt_start(task_looprt_stack, 512, &task_looprt_task);
  loopset_led_hook_on_looprt();

  easyflash_init();
  vfs_init();
  vfs_device_init();

  /* setup uart */
  if (get_dts_addr("uart", &fdt, &offset) == 0)
  {
    vfs_uart_init(fdt, offset);
  }

  if (get_dts_addr("gpio", &fdt, &offset) == 0)
  {
    hal_gpio_init_from_dts(fdt, offset);
  }

  /* initialize command line */
#ifdef CONF_USER_ENABLE_VFS_ROMFS
  romfs_register();
#endif

  aos_loop_init();

  aos_register_event_filter(EV_WIFI, event_cb_wifi_event, NULL);
  printf("[WIFI] Starting WiFi stack\r\n");

  /* start wifi firmware */
  hal_wifi_start_firmware_task();
  aos_post_event(EV_WIFI, CODE_WIFI_ON_INIT_DONE, 0);

  printf("[WIFI] Firmware loaded\r\n");

  aos_loop_run();

  /* will hopefully never happen */
  printf("[WIFI] Exiting WiFi task - should never happen\r\n");
  vTaskDelete(NULL);
}
