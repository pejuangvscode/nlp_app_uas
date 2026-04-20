# ⚕️ RAPHA MEDICAL AI

> AI-powered clinical NLP platform — diagnose diseases from patient narratives.

[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](./backend)
[![Frontend](https://img.shields.io/badge/Frontend-React+Vite-646CFF?logo=vite)](./frontend)
[![Deploy](https://img.shields.io/badge/Deploy-Fly.io_+_Vercel-000?logo=vercel)](./docs)

---

## 📋 Deskripsi

**RAPHA MEDICAL AI** adalah platform diagnosis penyakit berbasis AI yang menganalisis narasi/cerita pasien dalam bahasa Indonesia maupun Inggris dan mengembalikan:

- 🏥 **Diagnosis utama** + kode ICD-10
- 📊 **Confidence score** (0–100%)
- 📋 **Rekomendasi tindakan** medis
- 🔬 **Diagnosis banding** (differential diagnosis)

---

## 🏗 Arsitektur

```
User → Frontend (Vite+React @ Vercel)
             ↓  POST /api/v1/diagnose
       Backend (FastAPI @ Fly.io)
             ↓
       NLP Model (Dummy → HuggingFace)
```

---

## 📁 Struktur Proyek

```
interface/
├── frontend/          # React + Vite → deploy ke Vercel
├── backend/           # FastAPI Python → deploy ke Fly.io
└── docs/
    ├── deploy-frontend.md    # Panduan deploy Vercel
    ├── deploy-backend.md     # Panduan deploy Fly.io
    └── deploy-model.md       # Panduan ganti model HuggingFace
```

---

## 🚀 Quick Start (Development)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs tersedia di: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka: http://localhost:5173

---

## 🌐 API Endpoint

```http
POST /api/v1/diagnose
Content-Type: application/json

{
  "patient_narrative": "Pasien mengeluh sakit kepala parah...",
  "language": "id"
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "diagnosis": "Hypertension Stage 2",
  "confidence": 0.87,
  "icd_code": "I10",
  "recommendations": ["..."],
  "differential_diagnoses": ["..."],
  "model_version": "dummy-v0.1",
  "processing_time_ms": 523.4
}
```

### API Authentication (untuk monetisasi)

Set `REQUIRE_API_KEY=true` dan `VALID_API_KEYS=key1,key2` di environment backend.

Klien menggunakan:
```http
X-API-Key: your-api-key-here
```

---

## 📚 Deployment

| Komponen | Platform | Panduan |
|----------|----------|---------|
| Frontend | Vercel | [docs/deploy-frontend.md](./docs/deploy-frontend.md) |
| Backend | Fly.io | [docs/deploy-backend.md](./docs/deploy-backend.md) |
| Model NLP | HuggingFace | [docs/deploy-model.md](./docs/deploy-model.md) |

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `REQUIRE_API_KEY` | `false` | Aktifkan auth API key |
| `VALID_API_KEYS` | `""` | Key yang valid (comma-separated) |
| `ALLOWED_ORIGINS` | `*` | CORS origins |
| `MODEL_NAME` | `dummy-v0.1` | Nama model HuggingFace |

### Frontend (`frontend/.env`)
| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `VITE_API_BASE_URL` | `""` (proxy) | URL backend di production |

---

## ⚠️ Disclaimer

Hasil analisis AI ini **bukan pengganti diagnosis dokter**. Gunakan sebagai referensi awal dan selalu konsultasikan ke tenaga medis profesional.

---

© 2025 RAPHA MEDICAL AI Team
