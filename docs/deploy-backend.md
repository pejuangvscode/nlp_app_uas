# 🚀 Deploy Backend ke Fly.io

Panduan step-by-step untuk mendeploy FastAPI backend RAPHA MEDICAL AI ke [Fly.io](https://fly.io).

---

## Prasyarat

- [ ] Akun Fly.io (daftar di [fly.io](https://fly.io))
- [ ] Docker terinstall dan berjalan
- [ ] Python 3.11+ (untuk testing lokal)

---

## Langkah 1 — Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

Verifikasi:
```bash
fly version
```

---

## Langkah 2 — Login ke Fly.io

```bash
fly auth login
# Browser akan terbuka → login dengan akun Anda
```

---

## Langkah 3 — Buat Aplikasi Fly.io

```bash
cd interface/backend

# Launch aplikasi baru (jangan deploy dulu)
fly launch --no-deploy --name rapha-medical-ai-backend --region sin
```

> **Region `sin`** = Singapore (paling dekat dengan Indonesia 🇮🇩)

Fly CLI akan mendeteksi Dockerfile secara otomatis dan mengupdate `fly.toml`.

---

## Langkah 4 — Set Environment Secrets

Secrets disimpan secara aman di Fly.io (tidak ada di `fly.toml`):

```bash
# WAJIB: Atur asal yang diizinkan (URL frontend Vercel)
fly secrets set ALLOWED_ORIGINS="https://rapha-medical-ai.vercel.app,http://localhost:5173" \
  --app rapha-medical-ai-backend

# Opsional: Aktifkan API Key auth (untuk monetisasi nanti)
# fly secrets set REQUIRE_API_KEY="true" --app rapha-medical-ai-backend
# fly secrets set VALID_API_KEYS="key1,key2,key3" --app rapha-medical-ai-backend
```

---

## Langkah 5 — Deploy

```bash
fly deploy --app rapha-medical-ai-backend
```

Fly.io akan:
1. Build Docker image
2. Push ke registry Fly.io
3. Deploy ke region Singapore
4. Jalankan health check di `/api/v1/health`

---

## Langkah 6 — Verifikasi

```bash
# Cek status
fly status --app rapha-medical-ai-backend

# Lihat logs
fly logs --app rapha-medical-ai-backend

# Test health endpoint
curl https://rapha-medical-ai-backend.fly.dev/api/v1/health

# Test diagnosis endpoint
curl -X POST https://rapha-medical-ai-backend.fly.dev/api/v1/diagnose \
  -H "Content-Type: application/json" \
  -d '{"patient_narrative": "Pasien mengeluh sakit kepala parah sejak 3 hari, disertai demam dan mual.", "language": "id"}'
```

---

## Update / Re-Deploy

```bash
# Setelah mengubah kode backend:
cd interface/backend
fly deploy --app rapha-medical-ai-backend
```

---

## Mengaktifkan API Key Auth (Saat Menjual API)

```bash
# 1. Generate API key yang aman
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Simpan key ke Fly.io secrets (pisahkan dengan koma untuk multiple keys)
fly secrets set REQUIRE_API_KEY="true" --app rapha-medical-ai-backend
fly secrets set VALID_API_KEYS="<key1>,<key2>" --app rapha-medical-ai-backend

# 3. Re-deploy tidak perlu — secrets langsung aktif
```

Pelanggan API menggunakan key dengan header:
```http
POST /api/v1/diagnose
X-API-Key: <api-key>
Content-Type: application/json
```

---

## Scale Up (Saat Traffic Meningkat)

```bash
# Tambah memory
fly scale memory 1024 --app rapha-medical-ai-backend

# Tambah CPU
fly scale vm shared-cpu-2x --app rapha-medical-ai-backend

# Tambah instance (untuk high availability)
fly scale count 2 --app rapha-medical-ai-backend
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Health check gagal | Cek `fly logs` — biasanya import error di Python |
| CORS error | Update `ALLOWED_ORIGINS` via `fly secrets set` |
| Build gagal | Cek Dockerfile dan requirements.txt |
| Model lambat | Upgrade VM ke `shared-cpu-2x` atau tambah memory |
| 401 Unauthorized | API key auth aktif tapi key salah |

---

## URL API Anda

Setelah deploy berhasil:
- **API Base**: `https://rapha-medical-ai-backend.fly.dev`
- **Swagger UI**: `https://rapha-medical-ai-backend.fly.dev/docs`
- **ReDoc**: `https://rapha-medical-ai-backend.fly.dev/redoc`
- **Health**: `https://rapha-medical-ai-backend.fly.dev/api/v1/health`
