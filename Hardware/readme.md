
# Smart Light Management Firmware for BL602
#### STEPS to Succesfully Flash on BL602 from GNU/Linux (VM) on Apple Silicon



## VM Deployment

To deploy this project run,
Choice of Linux Hypervisor - UTM

ISO - Ubuntu 22.04 LTS AMD64 x86-64

System conf : 4GB, 4 core, i9 (default), 64Gb, vitruo-gpi-pc, balloon mode, sharing and usb enabled


## Installation

First Install the project packages

```bash
  sudo apt update
```

Download spice agents to activate clipboard and remote folder 
```bash
  sudo apt install spice-webdavd spice-wdagent
```
Next we install screen(to interface with PineCone from the terminal)
```bash
  sudo apt install screen
```

Installing prerequisites 
```bash
  sudo apt install build-essential python3 python3-pip git screen
```
Cloning the BL602 SDK 
```bash
  git clone --recursive https://github.com/pine64/bl_iot_sdk
```



## Setting Up BL602 Environment Variables

To run this project, you will need to add the following environment variables to your .bashrc file in the bl_iot_sdk folder or execute them as commands in the terminal

We enter the SDK folder on the terminal
```bash
  cd bl_iot_sdk
```    
Then either add these to .bashrc file or in terminal

`export BL60X_SDK_PATH=$(pwd)`

`export CONFIG_CHIP_NAME=BL602`

When connected via USB type, (Device will be displayed as QinHeng Manufacturing)
```bash
  lsusb
```     


## Documentation - Compiling/Building the Firmware

In the respective firmware folder execute the build file first, 
```bash
  ./genromap
```
After a successful build, build_out folder with our application.bin is created, flash our custom software onto the bl602 using the blflash tool, 
```bash
  ~/bl_iot_sdk/customer_app/tt_app_adc$ sudo /home/meduri/bl_iot_sdk/blflash flash ./build_out/tt_app_adc.bin --port /dev/ttyUSB0
```
Communicating to the USB port,
```bash
  sudo screen /dev/ttyUSB0 2000000
```
