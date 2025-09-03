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

## License

MIT
