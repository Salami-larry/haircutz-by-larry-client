# Haircutz by Larry — Client

Next.js storefront for **Haircutz by Larry** (catalogue, booking, track).

## Prerequisites

- Node 20+
- Backend running (see `haircutz-by-larry-be`)

## Environment

Create `.env.local` in this folder (never commit it):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | yes | API base URL (default `http://localhost:8080`) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Phase 4+ | Paystack public key |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
