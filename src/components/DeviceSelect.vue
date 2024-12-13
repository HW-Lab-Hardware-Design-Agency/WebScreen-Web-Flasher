<template>
  <v-card class="ma-4">
    <v-card-title>Device Selection</v-card-title>
    <v-card-text>
      <v-select
        v-model="selectedDevice"
        :items="devices"
        item-text="name"
        item-value="id"
        label="Select Device"
        @change="$emit('device-selected', selectedDevice)"
      ></v-select>
    </v-card-text>
  </v-card>
</template>

<script>
import { SUPPORTED_DEVICES } from '@/constants/devices';

export default {
  name: 'DeviceSelect',
  data: () => ({
    selectedDevice: null,
    devices: SUPPORTED_DEVICES
  })
};
</script>