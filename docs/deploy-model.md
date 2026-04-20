# 🧠 Mengganti Dummy Model dengan HuggingFace Model

Panduan cara mengganti model dummy dengan model NLP dari HuggingFace.
**Hanya perlu mengubah 1 file**: `backend/app/models/nlp_model.py`

---

## Konsep Arsitektur

```
DiagnoseRequest (patient_narrative)
        │
        ▼
  NLPModel.predict()          ← Ganti implementasi di sini
        │
        ▼
  DiagnoseResponse (diagnosis, confidence, recommendations, dll)
```

API endpoint, auth, dan schema **tidak perlu diubah**. 🎉

---

## Langkah 1 — Pilih Model dari HuggingFace

Beberapa model yang relevan untuk diagnosis dari teks narasi pasien:

| Model | Task | Link |
|-------|------|------|
| `kalisokrates/indobert-medical-ner` | NER (entitas medis) | [HF](https://huggingface.co/kalisokrates/indobert-medical-ner) |
| `indobenchmark/indobert-base-p1` | Base model Indonesia | [HF](https://huggingface.co/indobenchmark/indobert-base-p1) |
| `models-lab/medical-chatbot` | Medical QA | [HF](https://huggingface.co/models-lab/medical-chatbot) |
| `allenai/led-base-16384` | Long document summarization | [HF](https://huggingface.co/allenai/led-base-16384) |
| Model fine-tuned sendiri | Custom classification | Upload ke HF Hub |

> 💡 **Rekomendasi**: Fine-tune `indobert-base-p1` dengan dataset penyakit Indonesia untuk hasil terbaik.

---

## Langkah 2 — Update requirements.txt

Buka `backend/requirements.txt` dan uncomment:

```txt
# Sebelum (dummy):
# transformers>=4.40.0
# torch>=2.2.0
# sentencepiece>=0.2.0
# accelerate>=0.30.0

# Sesudah (aktifkan):
transformers>=4.40.0
torch>=2.2.0
sentencepiece>=0.2.0
accelerate>=0.30.0
```

---

## Langkah 3 — Update nlp_model.py

Ganti bagian-bagian berikut di `backend/app/models/nlp_model.py`:

### 3a. Ubah `MODEL_NAME` default

```python
# Sebelum:
def __init__(self, model_name: str = "dummy-v0.1"):

# Sesudah:
def __init__(self, model_name: str = "your-username/your-medical-model"):
```

### 3b. Ganti `_load_model()`

```python
def _load_model(self) -> None:
    from transformers import pipeline
    
    self._model = pipeline(
        "text-classification",     # Ganti sesuai task model Anda
        model=self.model_name,
        tokenizer=self.model_name,
        device=-1,                 # -1 = CPU, 0 = GPU pertama
        truncation=True,
        max_length=512,
    )
    logger.info(f"[NLPModel] HuggingFace model '{self.model_name}' loaded.")
```

### 3c. Ganti `predict()`

```python
def predict(self, text: str, language: str = "id") -> dict:
    import time
    start = time.perf_counter()
    
    # Jalankan inferensi
    result = self._model(text, truncation=True, max_length=512)
    
    elapsed_ms = (time.perf_counter() - start) * 1000
    
    # Map output model ke format response
    # (Sesuaikan dengan format output model Anda)
    top_result = result[0]
    
    return {
        "diagnosis": self._map_label(top_result["label"]),
        "confidence": round(top_result["score"], 4),
        "icd_code": self._get_icd_code(top_result["label"]),
        "recommendations": self._get_recommendations(top_result["label"]),
        "differential_diagnoses": [],
        "processing_time_ms": round(elapsed_ms, 2),
    }

def _map_label(self, label: str) -> str:
    """Map model label ke nama diagnosis yang human-readable."""
    label_map = {
        "LABEL_0": "Hipertensi",
        "LABEL_1": "Diabetes Mellitus",
        # dll...
    }
    return label_map.get(label, label)
```

---

## Langkah 4 — Update `fly.toml`

```toml
[env]
  MODEL_NAME = "your-username/your-medical-model"  # ← Ganti ini
```

Atau via secrets (lebih aman):
```bash
fly secrets set MODEL_NAME="your-username/your-medical-model" \
  --app rapha-medical-ai-backend
```

---

## Langkah 5 — Update Dockerfile (untuk model besar)

Jika model HuggingFace besar (>1GB), tambahkan caching di Dockerfile:

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model saat build (opsional, agar startup lebih cepat)
ARG MODEL_NAME="your-username/your-medical-model"
RUN python -c "from transformers import pipeline; pipeline('text-classification', model='${MODEL_NAME}')"

COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

> ⚠️ Pre-download model membuat Docker image lebih besar. Pertimbangkan upgrade VM Fly.io ke `performance-2x` untuk model besar.

---

## Langkah 6 — Update Scale di Fly.io

Model HuggingFace membutuhkan lebih banyak resource:

```bash
# Minimum untuk model ~500MB
fly scale vm shared-cpu-2x --app rapha-medical-ai-backend
fly scale memory 2048 --app rapha-medical-ai-backend

# Untuk model besar >1GB (gunakan GPU instance jika ada)
fly scale vm performance-4x --app rapha-medical-ai-backend
fly scale memory 4096 --app rapha-medical-ai-backend
```

---

## Langkah 7 — Deploy

```bash
cd interface/backend
fly deploy --app rapha-medical-ai-backend
```

---

## Checklist Penggantian Model

- [ ] Pilih model HuggingFace yang sesuai
- [ ] Uncomment dependencies di `requirements.txt`
- [ ] Update `_load_model()` dengan HuggingFace pipeline
- [ ] Update `predict()` untuk map output model ke response schema
- [ ] Update `MODEL_NAME` di `fly.toml` atau Fly secrets
- [ ] Update Dockerfile jika perlu pre-download model
- [ ] Scale VM Fly.io sesuai ukuran model
- [ ] Deploy dan test endpoint

---

## Tips

- **Rate limit HuggingFace**: Jika model di-download saat startup, set `HF_TOKEN` via `fly secrets` untuk menghindari rate limit.
- **Model versioning**: Gunakan commit SHA di model name (`model@sha256:abc123`) untuk reproducibility.
- **Cold start**: Enable `min_machines_running = 1` di `fly.toml` agar model selalu loaded.
