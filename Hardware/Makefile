#
# This is a project Makefile. It is assumed the directory this Makefile resides in is a
# project subdirectory.
#

PROJECT_NAME := tt_lus_beta
PROJECT_PATH := $(abspath .)
PROJECT_BOARD := evb
export PROJECT_PATH PROJECT_BOARD
#CONFIG_TOOLPREFIX :=


-include ./proj_config.mk

CFLAGS += -DLWIP_ALTCP_TLS
CFLAGS += -DLWIP_ALTCP_TLS_MBEDTLS

ifeq ($(origin BL60X_SDK_PATH), undefined)
$(error ****** Please set SDK paths ******)
endif

COMPONENTS_NETWORK := sntp dns_server
COMPONENTS_BLSYS   := bltime blfdt blmtd blota bloop loopadc looprt loopset
COMPONENTS_VFS     := romfs

INCLUDE_COMPONENTS += freertos_riscv_ram bl602 bl602_std bl602_wifi bl602_wifidrv hal_drv lwip lwip_dhcpd vfs yloop utils cli httpc netutils blog blog_testc mbedtls cjson altcp_tls httpd
INCLUDE_COMPONENTS += easyflash4
INCLUDE_COMPONENTS += $(COMPONENTS_NETWORK)
INCLUDE_COMPONENTS += $(COMPONENTS_BLSYS)
INCLUDE_COMPONENTS += $(COMPONENTS_VFS)
INCLUDE_COMPONENTS += $(PROJECT_NAME)
include $(BL60X_SDK_PATH)/make_scripts_riscv/project.mk