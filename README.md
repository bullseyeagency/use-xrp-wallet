# UseXRP Wallet

macOS Electron wallet for AI agents and humans on the XRPL.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run package
```

## Agent API

OpenClaw calls `localhost:7373` with `Authorization: Bearer <token>`:

- `GET  /health`   — check wallet is running
- `GET  /balance`  — drops, XRP, USD
- `GET  /address`  — wallet address
- `POST /pay`      — `{ to, drops }` → `{ txHash }`
