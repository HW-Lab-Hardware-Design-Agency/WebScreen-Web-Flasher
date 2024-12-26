// src/main.js
import './style.css'  // We'll move the CSS here

// Import your manifest files
import manifestArduinoNano from './manifest/manifest_arduino_nano_esp32.json'
import manifestEsp32S3_16MB from './manifest/manifest_esp32-s3-devkitc-1_16MB.json'
import manifestEsp32S3_8MB from './manifest/manifest_esp32-s3-devkitc-1_8MB.json'
import manifestLilygo from './manifest/manifest_lilygo_t_embed_cc1101.json'

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const installButton = document.querySelector("esp-web-install-button");

  // Listen to device & version radio changes
  document
    .querySelectorAll('input[name="device"]')
    .forEach((el) => el.addEventListener("change", updateManifest));
  document
    .querySelectorAll('input[name="fwVersion"]')
    .forEach((el) => el.addEventListener("change", updateManifest));

  function updateManifest() {
    const device = document.querySelector('input[name="device"]:checked')?.value;
    const version = document.querySelector('input[name="fwVersion"]:checked')?.value;

    if (!device || !version) {
      installButton.classList.add("invisible");
      return;
    }

    // Use imported manifests instead of file paths
    const manifests = {
      'arduino_nano_esp32': manifestArduinoNano,
      'esp32-s3-devkitc-1_16MB': manifestEsp32S3_16MB,
      'esp32-s3-devkitc-1_8MB': manifestEsp32S3_8MB,
      'lilygo_t_embed_cc1101': manifestLilygo
    };

    installButton.manifest = manifests[device];
    installButton.classList.remove("invisible");
  }
});