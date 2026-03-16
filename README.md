# Organizaciones CABA

Dashboard de organizaciones comunitarias de Buenos Aires (CABA).

## Setup

```bash
npm install
cp .env.example .env
# Completar con tus credenciales de Supabase
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |

## Deploy

Desplegado en Vercel. Las variables de entorno se configuran en el dashboard de Vercel.
