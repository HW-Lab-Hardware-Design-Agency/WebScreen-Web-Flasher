document.addEventListener('DOMContentLoaded', () => {
    const installButton = document.querySelector("esp-web-install-button");
    const statusDiv = document.getElementById('status');
    const downloadButton = document.getElementById('downloadFirmware');
    const versions = new Map([
        ['main', 'Stable Release'],
        ['3.x', '3.x Development'],
        ['4.x', '4.x Development — LVGL 9.5']
    ]);
    let manifestUrl = null;
    let downloadController = null;

    // Listen to version radio changes
    document.querySelectorAll('input[name="version"]').forEach((el) => {
        el.addEventListener("change", updateManifest);
    });

    function updateManifest() {
        const version = document.querySelector('input[name="version"]:checked')?.value;

        if (downloadController) {
            downloadController.abort();
            downloadController = null;
        }
        downloadButton.disabled = false;
        downloadButton.textContent = 'Download firmware (.bin)';
        if (manifestUrl) URL.revokeObjectURL(manifestUrl);
        manifestUrl = null;

        if (!versions.has(version)) {
            installButton.classList.add("invisible");
            installButton.manifest = '';
            downloadButton.hidden = true;
            hideStatus();
            return;
        }

        // Create manifest dynamically
        const manifest = createManifest(version);

        // Convert manifest object to blob URL
        const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
            type: 'application/json'
        });
        manifestUrl = URL.createObjectURL(manifestBlob);

        installButton.manifest = manifestUrl;
        installButton.classList.remove("invisible");
        downloadButton.hidden = false;

        showStatus(`Ready: ${versions.get(version)}`, 'success');
    }

    function createManifest(version) {
        const branch = version; // 'main', '3.x', or '4.x'
        const baseUrl = `https://raw.githubusercontent.com/HW-Lab-Hardware-Design-Agency/WebScreen-Software/${branch}/webscreen/build/esp32.esp32.esp32s3`;

        // ESP32-S3 VID/PID for WebScreen board
        const ESP_VENDOR_ID = 0x303A;
        const ESP_PRODUCT_ID = 0x1001;

        return {
            name: `WebScreen (${versions.get(version)})`,
            version: version,
            new_install_prompt_erase: true,
            builds: [
                {
                    chipFamily: "ESP32-S3",
                    parts: [
                        {
                            path: `${baseUrl}/webscreen.ino.merged.bin`,
                            offset: 0
                        }
                    ]
                }
            ],
            // Filter to show only WebScreen devices
            allowedUsbIds: [
                {
                    vendorId: ESP_VENDOR_ID,
                    productId: ESP_PRODUCT_ID
                }
            ]
        };
    }

    downloadButton.addEventListener('click', async () => {
        const version = document.querySelector('input[name="version"]:checked')?.value;
        if (!versions.has(version) || downloadController) return;
        const controller = new AbortController();
        downloadController = controller;
        downloadButton.disabled = true;
        downloadButton.textContent = 'Downloading…';
        showStatus(`Downloading ${versions.get(version)}…`, 'info');
        // Bound stalled downloads; selecting another version cancels this one.
        const timeout = setTimeout(() => controller.abort(), 120000);
        try {
            const manifest = createManifest(version);
            const response = await fetch(manifest.builds[0].parts[0].path, {
                signal: controller.signal,
                cache: 'no-cache'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            if (!blob.size) throw new Error('The firmware file is empty');
            const header = new Uint8Array(await blob.slice(0, 1).arrayBuffer());
            if (header[0] !== 0xe9) throw new Error('The file is not an ESP firmware image');
            if (controller.signal.aborted || downloadController !== controller) return;
            const url = URL.createObjectURL(blob);
            try {
                const link = document.createElement('a');
                link.href = url;
                link.download = `webscreen-${version}-merged.bin`;
                document.body.appendChild(link);
                link.click();
                link.remove();
            } finally {
                // Let the browser consume the URL before releasing the image buffer.
                setTimeout(() => URL.revokeObjectURL(url), 60000);
            }
            showStatus(`Download started: webscreen-${version}-merged.bin`, 'success');
        } catch (error) {
            if (downloadController === controller) {
                const message = controller.signal.aborted ? 'The request timed out' : error.message;
                showStatus(`Download failed: ${message}. Please try again.`, 'error');
            }
        } finally {
            clearTimeout(timeout);
            if (downloadController === controller) {
                downloadController = null;
                downloadButton.disabled = false;
                downloadButton.textContent = 'Download firmware (.bin)';
            }
        }
    });

    updateManifest();

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
    }

    function hideStatus() {
        statusDiv.style.display = 'none';
    }

    // Listen for installation events
    installButton.addEventListener('state-changed', (e) => {
        const state = e.detail.state;
        switch (state) {
            case 'initializing':
                showStatus('Initializing connection...', 'info');
                break;
            case 'preparing':
                showStatus('Preparing to flash...', 'info');
                break;
            case 'erasing':
                showStatus('Erasing flash memory...', 'info');
                break;
            case 'writing':
                showStatus('Writing firmware... Please wait.', 'info');
                break;
            case 'finished':
                showStatus('Firmware flashed successfully! Your device will restart.', 'success');
                break;
            case 'error':
                showStatus('Error occurred during flashing. Please try again.', 'error');
                break;
        }
    });

    // Handle installation errors
    installButton.addEventListener('error', (e) => {
        showStatus(`Error: ${e.detail.message}`, 'error');
    });
});
