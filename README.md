
# 🧠 Captain Command Suggestor (CCS)

A hacker-themed, AI-augmented terminal launcher built for speed, precision, and aesthetic joy. Designed to empower developers with context-aware command suggestions, ergonomic input simulation, and green-over-black vibes.

## License
This project is licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for details.

# Installation:
Checkout release to download installers. To make sure AI suggestions work, set GOOGLE_GEMINI_API_KEY in your env file.

## ✨ Features

- 🔍 Subsequence search with blazing-fast filtering
- 🧠 Gemini-powered natural language command generation
- 🎯 Keystroke simulation engine with full layout support
- 🧪 Edge-case handling for shifted/special characters
- 🖼️ Hacker-inspired UI with dynamic sizing and overlays


# 📦 Tech Stack
- Rust (core engine)
- React + MUI (UI layer)
- Redis (state sync)
- Gemini AI (command augmentation)

# 💼 Hire Me
If this project resonates with you and you're looking for someone who builds ergonomic automation tools with creative flair—I'd love to connect.

- 📫 Email: govind@hbook.in / mailtoraygovind@gmail.com
- 🌐 Portfolio: me.hbook.in

# 🙌 Attribution
If you use this project, please credit it. A shoutout or backlink helps indie devs like me keep building cool stuff.



## 🚀 Getting Started



# rterminal

A cross-platform terminal utility with global hotkey, window management, and AI-powered autocomplete.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Rust](https://www.rust-lang.org/tools/install)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/):  
  Install with `cargo install tauri-cli`

## Installation

```sh
# Clone the repo
git clone <your-repo-url>
cd rterminal

# Install JS dependencies
pnpm install
# or
npm install
# or
yarn install
```

## Running in Development

```sh
# Start the Tauri app in dev mode
pnpm tauri dev
# or
npm run tauri dev
# or
yarn tauri dev
```

## Building for Release

```sh
pnpm tauri build
# or
npm run tauri build
# or
yarn tauri build
```

## AI Autocomplete

To enable AI-powered autocomplete, set the following environment variable before running:

```sh
export OPENAI_API_KEY=your_openai_api_key
```

On Windows (cmd):

```cmd
set OPENAI_API_KEY=your_openai_api_key
```

On Windows (PowerShell):

```powershell
$env:OPENAI_API_KEY="your_openai_api_key"
```

## Configuration

- Edit `config.json` to set your preferred hotkey and other options.

## Features

- Global hotkey to open a transparent, centered terminal window.
- Fuzzy and subsequence search for local suggestions.
- AI autocomplete (requires `GOOGLE_GEMINI_API_KEY` to be present in user ENV).
- Multi-monitor support.

