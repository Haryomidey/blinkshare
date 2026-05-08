# BlinkShare

BlinkShare is a browser-to-browser file sharing app with QR/code pairing, realtime signaling, and direct WebRTC file transfer.

## Requirements

- Node.js 22 or newer
- npm or pnpm
- Optional: MongoDB. If `MONGODB_URI` is not available, the backend falls back to in-memory storage.

## Environment

Frontend variables live in the repo-root `.env` file:

```env
VITE_API_URL=http://127.0.0.1:4000
VITE_REALTIME_URL=ws://127.0.0.1:4000/realtime
```

Backend variables live in `backend/.env`:

```env
PORT=4000
CLIENT_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
MONGODB_URI=
```

When testing from another device on your network, replace `127.0.0.1` in the frontend `.env` with your computer's LAN IP and add that frontend origin to `CLIENT_ORIGINS`.

## Development

Install dependencies:

```bash
npm install
npm --prefix backend install
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open the Vite URL, usually `http://127.0.0.1:5173`.

## Checks

```bash
npm run lint
npm --prefix backend run lint
npm run build
```
