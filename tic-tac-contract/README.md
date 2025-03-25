# Tic Tac Contract Game

A sophisticated implementation of Tic Tac Toe using boardgame.io and GalaChain for state persistence. This project demonstrates how to integrate a turn-based game engine with blockchain state management.

## Architecture

### Core Components

1. **Game Engine**: Uses boardgame.io for game logic, turn management, and state transitions
2. **Storage Layer**: Custom GalaChain storage adapter implementing boardgame.io's Async interface
3. **Client**: Vue.js frontend application
4. **Server**: Koa.js server with boardgame.io integration

### Key Features

- Full boardgame.io integration for game state management
- Custom Chainstore adapter for GalaChain persistence
- Comprehensive DTO layer for game state and chain operations
- Type-safe implementation using TypeScript

## Project Structure

```
tic-tac-contract/
├── client/              # Vue.js client application
├── server/              # Koa.js + boardgame.io server
│   └── src/
│       ├── chainstore.ts    # GalaChain storage adapter
│       ├── dtos.ts         # Data transfer objects
│       └── types.ts        # Type definitions
├── tictac-chaincode/    # GalaChain smart contract implementation
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

The project consists of three separate applications:
1. **Client**: Vue.js frontend for game interaction
2. **Server**: Koa.js server with boardgame.io integration and GalaChain storage
3. **Chaincode**: GalaChain smart contract for game state persistence

## Setup

The project requires setting up three components: the chaincode, server, and client.

### 1. Chaincode Setup

```bash
cd tictac-chaincode

# Install dependencies
npm install

# Build the chaincode
npm run build

# Deploy to local GalaChain network (requires galachain-cli)
galachain deploy
```

### 2. Server Setup

```bash
cd server

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Client Setup

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Once all components are running, open your browser and navigate to `http://localhost:5173`

## Building for Production

### Build Chaincode
```bash
cd tictac-chaincode
npm run build
```

### Build Server
```bash
cd server
npm run build
npm start
```

### Build Client
```bash
cd client
npm run build
```

## Implementation Details

The project uses a custom storage adapter (`Chainstore`) that bridges boardgame.io's state management with GalaChain:

- Game state is serialized and stored on-chain
- Uses composite keys for state organization
- Implements boardgame.io's async storage interface
- Handles transaction management and chain-specific requirements
- Business logic shared between server and chaincode ensure that moves are replayed and re-verified on-chain. 

For more details, see the implementation in `server/src/chainstore.ts`.
