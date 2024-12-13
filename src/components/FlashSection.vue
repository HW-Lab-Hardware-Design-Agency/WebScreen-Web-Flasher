<template>
  <v-card class="ma-4">
    <v-card-title>Flash Firmware</v-card-title>
    <v-card-text>
      <v-btn
        :disabled="!selectedDevice || isConnected"
        color="primary"
        @click="connectSerial"
        :loading="connecting"
      >
        {{ isConnected ? 'Connected' : 'Connect Device' }}
      </v-btn>
      
      <v-btn
        :disabled="!isConnected || flashing"
        color="success"
        class="ml-2"
        @click="startFlashing"
        :loading="flashing"
      >
        Flash Firmware
      </v-btn>

      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
      >
        {{ error }}
      </v-alert>

      <v-card-text v-if="flashing" class="text-center">
        <p>{{ flashStatus }}</p>
        <v-progress-linear
          :value="flashProgress"
          color="primary"
          height="25"
        >
          <template v-slot:default>
            <strong>{{ Math.ceil(flashProgress) }}%</strong>
</template>
        </v-progress-linear>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script>
import { ESPLoader } from 'esptool-js';
import { downloadFirmware, extractFirmware } from '@/services/firmware';

export default {
  name: 'FlashSection',
  props: {
    selectedDevice: {
      type: String,
      default: null
    }
  },
  data: () => ({
    isConnected: false,
    connecting: false,
    flashing: false,
    flashProgress: 0,
    flashStatus: '',
    error: null,
    espLoader: null,
    transport: null
  }),
  methods: {
    async connectSerial() {
      this.connecting = true;
      this.error = null;
      
      try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        this.transport = port;
        this.espLoader = new ESPLoader(this.transport, { debug: true });
        
        await this.espLoader.connect();
        const chipInfo = await this.espLoader.chipType();
        console.log('Connected to:', chipInfo);
        
        this.isConnected = true;
      } catch (err) {
        this.error = `Connection failed: ${err.message}`;
        console.error('Failed to connect:', err);
      } finally {
        this.connecting = false;
    }
    },

    async startFlashing() {
      this.flashing = true;
      this.flashProgress = 0;
      this.error = null;
      
      try {
        this.flashStatus = 'Downloading firmware...';
        const zipBlob = await downloadFirmware(this.selectedDevice);
        
        this.flashStatus = 'Extracting firmware...';
        const files = await extractFirmware(zipBlob);
        
        this.flashStatus = 'Erasing flash...';
        await this.espLoader.eraseFlash();
        
        this.flashStatus = 'Flashing bootloader...';
        await this.espLoader.writeFlash(0x1000, new Uint8Array(files.bootloader), 
          (progress) => this.updateProgress(0, 20, progress));
        
        this.flashStatus = 'Flashing partition table...';
        await this.espLoader.writeFlash(0x8000, new Uint8Array(files.partition),
          (progress) => this.updateProgress(20, 40, progress));
        
        this.flashStatus = 'Flashing boot_app0...';
        await this.espLoader.writeFlash(0xe000, new Uint8Array(files.boot_app0),
          (progress) => this.updateProgress(40, 60, progress));
        
        this.flashStatus = 'Flashing firmware...';
        await this.espLoader.writeFlash(0x10000, new Uint8Array(files.firmware),
          (progress) => this.updateProgress(60, 100, progress));
        
        this.flashStatus = 'Flash complete!';
        this.flashProgress = 100;
        
      } catch (err) {
        this.error = `Flashing failed: ${err.message}`;
        console.error('Flashing failed:', err);
      } finally {
        this.flashing = false;
  }
    },

    updateProgress(startPercent, endPercent, currentProgress) {
      this.flashProgress = startPercent + (endPercent - startPercent) * (currentProgress / 100);
    }
  }
};
</script>