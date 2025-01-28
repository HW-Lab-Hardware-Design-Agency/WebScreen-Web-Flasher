BUILD_TYPE=$1

mv ../firmware/esp32-s3-devkitc-1/* firmware/esp32-s3-devkitc-1/"$BUILD_TYPE"/
mv ../firmware/arduino_nano_esp32/* firmware/arduino_nano_esp32/"$BUILD_TYPE"/
mv ../firmware/lilygo_t_embed_cc1101/* firmware/lilygo_t_embed_cc1101/"$BUILD_TYPE"/