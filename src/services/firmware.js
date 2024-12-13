// src/services/firmware.js
import JSZip from 'jszip';

export async function downloadFirmware(device) {
  try {
    // Get the latest release
    const response = await fetch('https://api.github.com/repos/CapibaraZero/fw/releases/latest');
    const release = await response.json();
    
    // Find the asset for the selected device
    const asset = release.assets.find(asset => asset.name.includes(device));
    if (!asset) {
      throw new Error('No firmware found for selected device');
    }

    // Download the firmware zip
    const zipResponse = await fetch(asset.browser_download_url);
    const zipBlob = await zipResponse.blob();
    
    return zipBlob;
  } catch (error) {
    console.error('Error downloading firmware:', error);
    throw error;
  }
}

export async function extractFirmware(zipBlob) {
  try {
    const zip = await JSZip.loadAsync(zipBlob);
    
    // Extract required files
    const files = {
      bootloader: await zip.file('bootloader.bin').async('arraybuffer'),
      partition: await zip.file('partitions.bin').async('arraybuffer'),
      boot_app0: await zip.file('boot_app0.bin').async('arraybuffer'),
      firmware: await zip.file('firmware.bin').async('arraybuffer')
    };
    
    return files;
  } catch (error) {
    console.error('Error extracting firmware:', error);
    throw error;
  }
}
