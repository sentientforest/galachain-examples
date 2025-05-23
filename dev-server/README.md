# GalaChain Dev Server

The `dev-server` directory contains an optional server useful for local development. 

This development server is designed to be used in conjuction with a locally-running 
GalaChain instance and a front end 
similar to the Vue.js starter template found at `../dapp-template` in this `galachain-examples` repository. 

It features Cross-Origin Resource Sharing (CORS) support, user registration/creation, and proxying arbitrary methods to a running chaincode instance. You can use it as-is while 
developing your front end locally, and then switch your client's environment variables to 
point at main or testnet URLs when ready.

To get up and running locally, configure the path to the private key of a Curator user in `server/.env`. Assuming you are using GalaChain SDK version 2.x.x or higher, you should have a Chain API running on port 3000. If not, configure a URL to a running instance of the GalaChain Operations API.

This application is built with [AdonisJS](https://adonisjs.com/). Much of the source code 
is boilerplate generated by the Adonis cli. While the added functionality is quite minimal to start, and primarily intended for bridging local development between clients and chaincode, it could conceivably be extended into a production grade service. 

## Prerequisites

- Node.js (v18 or later, v20+ recommended)

## Setup and Installation

1. Clone the repository, or otherwise download/copy source code from this directory:
   ```bash
   git clone https://github.com/GalaChain/examples.git
   cd examples/dev-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a server-side `.env` file by copying the `.env.example` template:

  ```bash
  cp .env.example .env
  ```

  These `.env` files are excluded from version control to avoid committing sensitive data 
  to the repository history. Most of the defaults are provided if your intent is simply to 
  work with a local instance of GalaChain, but you will need to edit the new `.env` file with some information specific to your setup:

  ```
  CHAIN_ADMIN_SECRET_KEY_PATH=
  ```

  The `CHAIN_ADMIN_SECRET_KEY_PATH` shoud point to the default key generated for the Curator 
  administrator when running a local instance of GalaChain. Use an absolute path. For example, on a Linux system, this might be `/home/yourusername/yourproject/test-network/dev-admin-key/dev-admin.priv.hex.txt`. The contents of the `test-network` directory are generated when you run `npm run network:start` or `npm run network:up` in your chaincode project directory. 

  Beginning with version v2.x.x of the GalaChain public sdk, a locally-running, light-weight 
  version of GalaChain's Operations API is provided when you start the network. By default, it will be running locally on port 3000. If you wish to point the dev server at another URL or port, edit the following value in your `.env` file:

  ```
  CHAIN_API=http://localhost:3000
  ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   In another terminal, build and start the development server for the client:

   ```bash
   cd client
   npm run dev
   ```

## Features

- Full e2e local environment integration between a client application and running chaincode instance 
- Register new users against the locally running chain instance as needed after network prunes and re-ups
- Identity controller reads born-on-chain admin's key from local filesystem, registers new user identities, and can generate random user keys for local development. 
- Proxy controller forwards client-signed DTOs on to chain instance, and/or can be extended as needed for application-specific business logic, server-side processing, data validation, or database persistence. 
- A `CreateHeadlessWallet` endpoint registers users using the same API as provided by GalaConnect, without needing source code or a running instance of GalaConnect's services. Applications can switch over to the public GalaConnect API when deploying to production. 

## Additional Resources

- [GalaChain Documentation](https://docs.galachain.com)
- [GalaChain Connect Library](https://github.com/GalaChain/sdk)

