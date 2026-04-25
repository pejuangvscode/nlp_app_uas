# RAPHA Frontend

Frontend React + Vite untuk RAPHA MEDICAL AI.

Website ini sekarang fokus sebagai:
- Landing page dokumentasi API (style API reference)
- Playground untuk mencoba endpoint diagnosis langsung
- Shortcut ke Swagger UI dan OpenAPI JSON backend

## Run Web Server

```bash
cd frontend
npm install
npm run start
```

Alternatif command development:

```bash
npm run dev
```

Default URL local:
- http://localhost:5173

## Build Production

```bash
npm run build
npm run preview
```

## Environment Variable

Buat file `.env` di folder `frontend/` jika perlu:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Jika tidak diisi, aplikasi fallback ke `http://localhost:8000`.

## Fitur Halaman

- Overview API + base URL
- Authentication docs (X-API-Key)
- Endpoint reference:
  - GET /api/v1/health
  - POST /api/v1/diagnose
- Contoh payload request/response
- Daftar status code
- Playground form untuk uji diagnosis
