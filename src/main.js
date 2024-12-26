// src/main.js
import './style.css'  // We'll move the CSS here

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
    console.log(device);
    console.log(version)
    if (!device || !version) {
      installButton.classList.add("invisible");
      return;
    }

    // Use imported manifests instead of file paths
    const manifests = {
      'arduino_nano_esp32': `/manifest/${version}/manifest_arduino_nano_esp32.json`,
      'esp32-s3-devkitc-1_16MB': `/manifest/${version}/manifest_esp32-s3-devkitc-1_16MB.json`,
      'esp32-s3-devkitc-1_8MB': `/manifest/${version}/manifest_esp32-s3-devkitc-1_8MB.json`,
      'lilygo_t_embed_cc1101': `/manifest/${version}/manifest_lilygo_t_embed_cc1101.json`
    };

    installButton.manifest = manifests[device];
    console.log(installButton.manifest)
    installButton.classList.remove("invisible");
  }
});