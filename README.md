# WebScreen Web Flasher

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT) [![image](https://img.shields.io/badge/website-WebScreen.cc-D31027)](https://webscreen.cc) [![image](https://img.shields.io/badge/view_on-CrowdSupply-099)](https://www.crowdsupply.com/hw-media-lab/webscreen)

Flash WebScreen firmware directly from your browser - no IDE or setup required!

## Usage

1. Open `index.html` in Chrome, Edge, or Opera
2. Select firmware version (Stable or Development)
3. Connect WebScreen via USB and enter boot mode:
   - Hold **BOOT** button → Press **RESET** → Release **BOOT**
4. Click "Connect & Flash WebScreen"
5. Select your device and wait for completion

## Features

- Browser-based flashing with Web Serial API
- Auto-detects WebScreen devices (VID: 0x303A, PID: 0x1001)
- Pulls firmware from [WebScreen Software Repository](https://github.com/HW-Lab-Hardware-Design-Agency/WebScreen-Software)
- Choose between stable (main) or development (dev) builds

## Requirements

- Chrome, Edge, or Opera browser
- WebScreen WebScreen device
- USB cable with data support

## License

MIT License - see [LICENSE](LICENSE) for details.