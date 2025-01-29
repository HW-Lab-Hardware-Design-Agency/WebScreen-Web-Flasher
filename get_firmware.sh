BUILD_TYPE=$1

mv firmware/esp32-s3-devkitc-1/* public/firmware/esp32-s3-devkitc-1/"$BUILD_TYPE"/
mv firmware/arduino_nano_esp32/* public/firmware/arduino_nano_esp32/"$BUILD_TYPE"/
mv firmware/lilygo_t_embed_cc1101/* public/firmware/lilygo_t_embed_cc1101/"$BUILD_TYPE"/
