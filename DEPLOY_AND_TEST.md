# Deploy Agent UI to agent.edoncore.com

## Render (recommended)

If this `edon-agent-ui` folder is in its own repo, you can use the `render.yaml`
in this folder as a Blueprint (must be at repo root for Render). If this is part
of the `edon-cav-engine` monorepo, create a **Static Site** in Render manually
and set the **Root directory** to `edon-agent-ui`.

**Build settings:**
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

**Environment variables:**
- `VITE_EDON_GATEWAY_URL=https://edon-gateway.onrender.com`
- `VITE_EDON_MOCK_MODE=false`

**Custom domain:**
- Add `agent.edoncore.com` in Render
- Create a DNS CNAME record: `agent` → `<your-site>.onrender.com`

**SPA rewrite (required for React Router):**
- Rewrite `/*` → `/index.html`

## Vercel / Netlify (alternatives)

Deploy as a Vite static site with output `dist`, then add the custom domain
`agent.edoncore.com`. Make sure you configure the SPA fallback (rewrite to
`/index.html`) so deep links do not 404.
