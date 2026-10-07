# Tournament X — Frontend

## Setup

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

## Variáveis de ambiente

Edite `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:80       # URL do backend
NEXT_PUBLIC_DISCORD_CLIENT_ID=...            # Discord App Client ID
DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Estrutura

```
app/
  page.tsx              → Landing page
  login/page.tsx        → Login via Discord
  auth/callback/page.tsx → OAuth callback
  tournaments/
    page.tsx            → Listagem de torneios
    [id]/page.tsx       → Página do torneio
    create/page.tsx     → Wizard de criação (5 etapas)
  dashboard/page.tsx    → Dashboard do usuário
  admin/page.tsx        → Painel administrativo
```
