<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 class="text-h3 text-center mb-6">Capibara Zero Flasher</h1>
        <device-select @device-selected="onDeviceSelected" />
        <flash-section :selected-device="selectedDevice" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import DeviceSelect from '@/components/DeviceSelect';
import FlashSection from '@/components/FlashSection';

export default {
  name: 'App',
  components: {
    DeviceSelect,
    FlashSection
  },
  data: () => ({
    selectedDevice: null
  }),
  methods: {
    onDeviceSelected(device) {
      this.selectedDevice = device;
    }
  }
};
</script>