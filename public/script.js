document.addEventListener('DOMContentLoaded', () => {
    const installButton = document.querySelector("esp-web-install-button");
    const statusDiv = document.getElementById('status');

    // Listen to version radio changes
    document.querySelectorAll('input[name="version"]').forEach((el) => {
        el.addEventListener("change", updateManifest);
    });

    function updateManifest() {
        const version = document.querySelector('input[name="version"]:checked')?.value;

        if (!version) {
            installButton.classList.add("invisible");
            hideStatus();
            return;
        }

        // Create manifest dynamically
        const manifest = createManifest(version);

        // Convert manifest object to blob URL
        const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
            type: 'application/json'
        });
        const manifestUrl = URL.createObjectURL(manifestBlob);

        installButton.manifest = manifestUrl;
        installButton.classList.remove("invisible");

        showStatus(`Ready to flash ${version} version`, 'success');
    }

    function createManifest(version) {
        const branch = version; // 'main' or 'dev'
        const baseUrl = `https://raw.githubusercontent.com/HW-Lab-Hardware-Design-Agency/WebScreen-Software/${branch}/webscreen/build/esp32.esp32.esp32s3`;

        // ESP32-S3 VID/PID for WebScreen board
        const ESP_VENDOR_ID = 0x303A;
        const ESP_PRODUCT_ID = 0x1001;

        return {
            name: `WebScreen (${version === 'main' ? 'stable' : 'development'})`,
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