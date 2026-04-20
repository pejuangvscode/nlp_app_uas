# 🚀 Deploy Frontend ke Vercel

Panduan step-by-step untuk mendeploy frontend RAPHA MEDICAL AI ke [Vercel](https://vercel.com).

---

## Prasyarat

- [ ] Akun Vercel (gratis di [vercel.com](https://vercel.com))
- [ ] Node.js ≥ 18 terinstall
- [ ] Backend sudah di-deploy ke Fly.io (dapatkan URL-nya dulu)
- [ ] Git repository (GitHub/GitLab/Bitbucket)

---

## Metode 1: Deploy via Vercel Dashboard (Direkomendasikan)

### Langkah 1 — Push ke GitHub

```bash
cd interface/
git init
git add .
git commit -m "feat: initial RAPHA MEDICAL AI setup"
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

### Langkah 2 — Import ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Klik **"Import Git Repository"**
3. Pilih repo yang baru Anda push
4. Pada **"Configure Project"**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`  ← **PENTING**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Langkah 3 — Set Environment Variables

Di halaman configure, klik **"Environment Variables"** dan tambahkan:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://rapha-medical-ai-backend.fly.dev` |

> ⚠️ Ganti URL di atas dengan URL backend Fly.io Anda yang sebenarnya.

### Langkah 4 — Deploy

Klik **"Deploy"**. Vercel akan:
1. Build frontend (`npm run build`)
2. Deploy ke CDN global
3. Memberikan URL seperti: `https://rapha-medical-ai.vercel.app`

---

## Metode 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy dari direktori frontend
cd interface/frontend
vercel

# Saat ditanya:
# - Set up and deploy? Y
# - Which scope? (pilih akun Anda)
# - Link to existing project? N
# - Project name: rapha-medical-ai
# - Directory: ./
# - Override settings? N
```

### Set Environment Variable via CLI

```bash
vercel env add VITE_API_BASE_URL production
# Masukkan: https://rapha-medical-ai-backend.fly.dev
```

---

## Update CORS di Backend

Setelah mendapat URL Vercel, update CORS di backend Fly.io:

```bash
fly secrets set ALLOWED_ORIGINS="https://rapha-medical-ai.vercel.app,http://localhost:5173" \
  --app rapha-medical-ai-backend
```

---

## Re-Deploy Otomatis

Setiap kali Anda `git push` ke branch `main`, Vercel akan otomatis re-deploy. ✅

---

## Custom Domain (Opsional)

1. Di Vercel dashboard → Project → **Settings → Domains**
2. Tambahkan domain Anda (misal: `rapha.ai`)
3. Update DNS records sesuai instruksi Vercel

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Build gagal | Pastikan `Root Directory` di Vercel = `frontend` |
| API tidak bisa diakses | Cek `VITE_API_BASE_URL` sudah benar |
| CORS error | Update `ALLOWED_ORIGINS` di backend dengan URL Vercel Anda |
| Blank page | Cek `Output Directory` = `dist` |
