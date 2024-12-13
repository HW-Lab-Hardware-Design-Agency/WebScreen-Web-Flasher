<template>
  <v-card class="ma-4">
    <v-card-title>Flash Firmware</v-card-title>
    <v-card-text>
      <v-btn :disabled="!selectedDevice || isConnected" color="primary" @click="connectSerial" :loading="connecting">
        {{ isConnected ? 'Connected' : 'Connect Device' }}
      </v-btn>

      <v-btn :disabled="!isConnected || flashing" color="success" class="ml-2" @click="startFlashing"
        :loading="flashing">
        Flash Firmware
      </v-btn>

      <v-btn :disabled="!isConnected || consoleActive" color="info" class="ml-2" @click="startConsole">
        Start Console
      </v-btn>

      <v-btn :disabled="!consoleActive" color="error" class="ml-2" @click="stopConsole">
        Stop Console
      </v-btn>

      <v-alert v-if="error" type="error" class="mt-4">
        {{ error }}
      </v-alert>

      <v-card-text v-if="flashing" class="text-center">
        <p>{{ flashStatus }}</p>
        <v-progress-linear :value="flashProgress" color="primary" height="25">
          <template v-slot:default>
            <strong>{{ Math.ceil(flashProgress) }}%</strong>
          </template>
        </v-progress-linear>
      </v-card-text>

      <v-card-text v-if="isConnected" class="mt-4">
        <div id="terminal" ref="terminal"></div>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<script>
import { ESPLoader, Transport } from 'esptool-js';
import { downloadFirmware, extractFirmware } from '@/services/firmware';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

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
    transport: null,
    terminal: null,
    consoleActive: false,
    isConsoleClosed: false
  }),
  mounted() {
    this.terminal = new Terminal({
      cols: 80,
      rows: 24,
      convertEol: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14
    });
  },
  methods: {
    async connectSerial() {
      this.connecting = true;
      this.error = null;

      try {
        const port = await navigator.serial.requestPort();
        this.transport = new Transport(port, true);

        const loaderOptions = {
          transport: this.transport,
          baudrate: 115200,
          terminal: {
            clean() { },
            writeLine(data) { console.log(data); },
            write(data) { console.log(data); }
          },
          debugLogging: true
        }
        this.espLoader = new ESPLoader(loaderOptions);

        const chipInfo = await this.espLoader.main();
        console.log('Connected to:', chipInfo);

        this.isConnected = true;
      } catch (err) {
        this.error = `Connection failed: ${err.message}`;
        console.error('Failed to connect:', err);
      } finally {
        this.connecting = false;
      }
    },

    async startConsole() {
      if (!this.transport || !this.terminal) return;

      try {
        if (!this.terminal.element) {
          this.terminal.open(this.$refs.terminal);
        }

        this.consoleActive = true;
        this.isConsoleClosed = false;

        await this.transport.connect(115200);

        while (!this.isConsoleClosed) {
          const readLoop = this.transport.rawRead();
          const { value, done } = await readLoop.next();

          if (done || !value) {
            break;
          }

          this.terminal.write(value);
        }
      } catch (err) {
        this.error = `Console error: ${err.message}`;
        console.error('Console error:', err);
      }
    },

    async stopConsole() {
      this.isConsoleClosed = true;
      this.consoleActive = false;

      if (this.transport) {
        await this.transport.disconnect();
        await this.transport.waitForUnlock(1500);
      }

      this.terminal.clear();
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
  },
  beforeDestroy() {
    if (this.terminal) {
      this.terminal.dispose();
    }
    this.stopConsole();
  }
};
</script>

<style scoped>
#terminal {
  background: #000;
  padding: 10px;
  border-radius: 4px;
}
</style>