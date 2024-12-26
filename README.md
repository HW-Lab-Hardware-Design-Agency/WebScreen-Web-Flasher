# CapibaraZero Web Flasher

A web-based firmware flashing tool for CapibaraZero devices. 

> CapibaraZero is an open-source, cost-effective alternative to the Flipper Zero device, offering functionalities like Wi-Fi, Bluetooth, NFC, and infrared communication.

This tool allows you to easily flash firmware to various supported devices directly from your web browser. You don't have to install IDE or CLI to flash your device anymore!

## Features

- Browser-based firmware flashing
- Support for multiple devices:
  - Arduino Nano ESP32
  - ESP32-S3-DevKitC-1 (16MB)
  - ESP32-S3-DevKitC-1 (8MB)
  - LILYGO T-Embed CC1101
- Version selection
- Simple and intuitive user interface

## Usage

1. Open the web flasher in your browser
2. Select your device type from the available options
3. Choose the firmware version you want to flash
4. Connect your device to your computer via USB
5. Click the flash button and follow the on-screen instructions

## Supported Devices

- Arduino Nano ESP32
- ESP32-S3-DevKitC-1 (16MB variant)
- ESP32-S3-DevKitC-1 (8MB variant)
- LILYGO T-Embed CC1101

## Project Structure

```
CapibaraZero-Web-Flasher/
├─ src/                      # Source code
│  ├─ manifest/              # Device manifest files
│  │  ├─ manifest_arduino_nano_esp32.json
│  │  ├─ manifest_esp32-s3-devkitc-1_16MB.json
│  │  ├─ manifest_esp32-s3-devkitc-1_8MB.json
│  │  └─ manifest_lilygo_t_embed_cc1101.json
│  ├─ main.js               # Main JavaScript file
│  ├─ index.html           # Main HTML file
│  └─ style.css            # Stylesheet
├─ public/                  # Static assets
│  └─ firmware/            # Firmware binary files
│     ├─ arduino_nano_esp32/
│     ├─ esp32-s3-devkitc-1_16MB/
│     ├─ esp32-s3-devkitc-1_8MB/
│     └─ lilygo_t_embed_cc1101/
├─ package.json            # Project dependencies and scripts
└─ vite.config.js         # Vite configuration
```

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Development

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CapibaraZero-Web-Flasher.git
```

2. Navigate to the project directory:
```bash
cd CapibaraZero-Web-Flasher
```

3. Install dependencies:
```bash
npm install
```

### Running the development server

To run the development server:

```bash
npm run dev
```

This will start a local development server, typically at `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any problems or have questions, please open an issue in the GitHub repository.