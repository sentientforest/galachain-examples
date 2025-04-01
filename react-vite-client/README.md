# GalaChain React + Vite Example

This is a modern React + Vite example application demonstrating GalaChain integration. It uses TypeScript, Tailwind CSS, and the latest React patterns with SSR capabilities.

## Features

- Wallet connection using GalaConnect
- GALA token balance display
- GALA token burning functionality
- Modern UI with Tailwind CSS
- Full TypeScript support
- Server-side rendering with Vite
- Fast development with HMR

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your specific configuration:
   - `VITE_API_URL`: URL of your GalaChain API server
   - `VITE_TOKEN_CONTRACT`: Token contract endpoint
   - `VITE_PUBLIC_KEY_CONTRACT`: Public key contract endpoint
   - `VITE_GALASWAP_API`: GalaSwap API endpoint (or the /identities endpoint of the local dev server provided in this example repo)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Project Structure

- `/src/components` - React components for wallet interaction and token operations
- `/src/utils` - Utility functions and helpers
- `/src/types` - TypeScript type definitions
- `/src/styles` - Global styles and Tailwind CSS configuration

## Dependencies

- Vite 5
- React 19
- TypeScript
- Tailwind CSS
- @gala-chain/api
- @gala-chain/connect
- ESLint + Prettier for code formatting

## Development

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
