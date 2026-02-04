# EDON Agent UI

User-facing UI for the EDON Gateway. Vite + React + TypeScript.

## Prerequisites

- Node 18+
- EDON Gateway running (e.g. `cd edon-gateway && docker compose up --build`)

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. Paste your gateway token in **Settings** (same value as `EDON_API_TOKEN` in the gateway `.env`). The status badge should show **Connected**.

## Run against Docker Compose gateway

1. Start the gateway: `cd edon-gateway && cp .env.example .env && # set EDON_API_TOKEN && docker compose up --build`
2. Start the UI: `cd edon-agent-ui && npm run dev`
3. Open http://localhost:5173 → **Settings** → paste the token → **Save**
4. Badge shows **Connected**; **Status** shows health and version; **Onboarding** runs the 3-step wizard (Connect Clawdbot → Apply policy → Test invoke).

## Where to paste the token

- **Settings** (gear or “Settings” in the top bar): Gateway URL and **Token** (masked). Token is stored in `localStorage` only; never in env or code.
- Use the same value as `EDON_API_TOKEN` in the gateway’s `.env`.

## Production

**Console URL:** https://agent.edoncore.com

### Deploy (Render recommended)

Use the deployment guide in `DEPLOY_AND_TEST.md` for exact steps, including
custom domain and SPA rewrite rules.

- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Env vars:** `VITE_EDON_GATEWAY_URL=https://edon-gateway.onrender.com`

## Troubleshooting

- **401 Unauthorized** — Token missing or wrong. Paste the same token set in the gateway as `EDON_API_TOKEN`; save in Settings.
- **Gateway unreachable / Offline** — Gateway not running or wrong URL. Ensure gateway is up (`docker compose up`) and Gateway URL in Settings matches (e.g. `http://localhost:8000`). If the UI runs on another host, use that host’s URL and ensure gateway CORS includes the UI origin.
