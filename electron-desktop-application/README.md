# Electron Desktop Application

A modern Electron desktop application built with TypeScript, React, and Vite.

## Features

- 🚀 Electron with TypeScript support
- ⚛️ React for the frontend
- 📦 Vite for fast development and building
- 🎨 Modern UI with CSS variables
- 🔒 Secure context isolation
- 🛠️ Hot Module Replacement (HMR) in development

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Packaging

```bash
npm run package
```

## Project Structure

```
electron-desktop-application/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts
│   │   └── preload.ts
│   └── renderer/       # React frontend
│       ├── components/
│       ├── styles/
│       ├── App.tsx
│       └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## License

MIT
