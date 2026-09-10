# WebScreen Web Flasher

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT) [![image](https://img.shields.io/badge/website-WebScreen.cc-D31027)](https://webscreen.cc) [![image](https://img.shields.io/badge/view_on-CrowdSupply-099)](https://www.crowdsupply.com/hw-media-lab/webscreen)

Flash WebScreen firmware directly from your browser - no IDE or setup required!

## Usage

1. Open [WebScreen Flasher](https://flash.webscreen.cc) in Chrome, Edge, or Opera
2. Select Stable (`main`), Development (`dev`), or **4.x Development — LVGL 9.5**
3. Connect WebScreen via USB and enter boot mode:
   - Hold **BOOT** button → Press **RESET** → Release **BOOT**
4. Click "Connect & Flash WebScreen"
5. Select your device and wait for completion

Choose **4.x** for the firmware 4.0 / LVGL 9.5 demo apps. This channel currently contains development firmware; it is separate from the stable release.

To save a binary without connecting a device, select a version and click **Download firmware (.bin)**. Both downloading and browser flashing use that branch's `webscreen.ino.merged.bin`. The saved file is named `webscreen-4.x-merged.bin` for 4.x and should be flashed at offset `0x0`. Changing versions cancels an unfinished download.

## Features

- Browser-based flashing with Web Serial API
- Auto-detects WebScreen devices (VID: 0x303A, PID: 0x1001)
- Pulls firmware from [WebScreen Software Repository](https://github.com/HW-Lab-Hardware-Design-Agency/WebScreen-Software)
- Choose between stable (`main`), development (`dev`), and LVGL 9.5 development (`4.x`) builds
- Download the selected merged firmware image for offline flashing

## Requirements

- Chrome, Edge, or Opera browser
- WebScreen device (only needed for flashing)
- USB cable with data support

## Local development and validation

This is a static site. Run `python3 -m http.server 8783 --bind 127.0.0.1 --directory public` and open <http://127.0.0.1:8783>.

With Playwright and Chrome installed, run `PLAYWRIGHT_PATH=/path/to/playwright node tests/browser.test.cjs`. Set `FLASHER_URL` for a different server. Tests cover all three manifests, download contents and filenames, failed requests, version switching, and mobile layout. They simulate the installer and never flash hardware.

## License

MIT License - see [LICENSE](LICENSE) for details.
