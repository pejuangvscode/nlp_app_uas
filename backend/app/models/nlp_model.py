"""
NLP Model Layer — Pluggable Design
====================================

This module is the single place you swap in a real HuggingFace model.
Currently uses a DUMMY implementation that returns realistic-looking random data.

TO SWAP IN A REAL HUGGINGFACE MODEL:
--------------------------------------
1. Install your model: add to requirements.txt
       transformers>=4.40.0
       torch>=2.0.0           (or tensorflow / flax)
       sentencepiece           (if tokenizer needs it)

2. Change the `MODEL_NAME` constant to your HuggingFace model ID, e.g.:
       MODEL_NAME = "kalisokrates/indobert-medical-ner"

3. Replace the `_load_model()` method body with:
       from transformers import pipeline
       self._pipe = pipeline(
           "text-classification",            # or "ner", "question-answering", etc.
           model=self.model_name,
           tokenizer=self.model_name,
       )

4. Replace the `predict()` method body with actual inference:
       result = self._pipe(text)[0]
       # Map result to DiagnoseResponse fields

That's it! The rest of the code (API, auth, CORS, schemas) stays the same.
"""

import random
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  Dummy data pools (realistic-looking outputs)
# ─────────────────────────────────────────────

DUMMY_DIAGNOSES = [
    {
        "diagnosis": "Hypertension Stage 2",
        "icd_code": "I10",
        "confidence_range": (0.72, 0.95),
        "recommendations": [
            "Segera konsultasi ke dokter spesialis jantung",
            "Pantau tekanan darah 2x sehari",
            "Kurangi asupan garam (< 5g/hari)",
            "Olahraga ringan 30 menit/hari",
            "Hindari stres berlebihan",
        ],
        "differentials": ["Hipertensi Sekunder", "White-coat Hypertension", "Penyakit Ginjal Kronis"],
    },
    {
        "diagnosis": "Type 2 Diabetes Mellitus",
        "icd_code": "E11",
        "confidence_range": (0.68, 0.91),
        "recommendations": [
            "Cek gula darah puasa dan HbA1c",
            "Diet rendah karbohidrat dan gula",
            "Konsultasi ke dokter endokrinologi",
            "Olahraga aerobik rutin",
            "Monitor berat badan",
        ],
        "differentials": ["Diabetes Mellitus Tipe 1", "Pre-diabetes", "MODY (Maturity-Onset Diabetes of the Young)"],
    },
    {
        "diagnosis": "Acute Upper Respiratory Infection",
        "icd_code": "J06.9",
        "confidence_range": (0.80, 0.97),
        "recommendations": [
            "Istirahat cukup minimal 7-8 jam/hari",
            "Perbanyak minum air putih",
            "Konsumsi obat simptomatik (paracetamol, dekongestan)",
            "Konsultasi dokter jika gejala > 7 hari",
            "Hindari kontak dengan orang lain",
        ],
        "differentials": ["Influenza", "COVID-19", "Pneumonia Ringan"],
    },
    {
        "diagnosis": "Migraine with Aura",
        "icd_code": "G43.1",
        "confidence_range": (0.65, 0.88),
        "recommendations": [
            "Identifikasi dan hindari trigger migrain",
            "Beristirahat di ruangan gelap dan tenang",
            "Konsumsi analgesik sesuai anjuran dokter",
            "Konsultasi ke dokter neurologi",
            "Pertimbangkan terapi pencegahan jika serangan > 4x/bulan",
        ],
        "differentials": ["Tension-type headache", "Cluster Headache", "Subarachnoid Hemorrhage"],
    },
    {
        "diagnosis": "Gastroesophageal Reflux Disease (GERD)",
        "icd_code": "K21.0",
        "confidence_range": (0.70, 0.93),
        "recommendations": [
            "Hindari makanan asam, pedas, dan berlemak",
            "Makan dalam porsi kecil tapi sering",
            "Jangan berbaring 2-3 jam setelah makan",
            "Konsumsi antasida atau PPI sesuai resep dokter",
            "Konsultasi ke dokter gastroenterologi",
        ],
        "differentials": ["Peptic Ulcer Disease", "Esophagitis", "Hiatal Hernia"],
    },
    {
        "diagnosis": "Dengue Fever",
        "icd_code": "A90",
        "confidence_range": (0.75, 0.94),
        "recommendations": [
            "SEGERA ke IGD rumah sakit terdekat",
            "Pantau tanda bahaya: gusi berdarah, bintik merah, sesak napas",
            "Minum banyak cairan / infus jika perlu",
            "Cek darah rutin (trombosit & hematokrit) setiap 24 jam",
            "Hindari aspirin dan ibuprofen",
        ],
        "differentials": ["Malaria", "Chikungunya", "Typhoid Fever", "Leptospirosis"],
    },
    {
        "diagnosis": "Anxiety Disorder (Generalized)",
        "icd_code": "F41.1",
        "confidence_range": (0.60, 0.85),
        "recommendations": [
            "Konsultasi ke psikiater atau psikolog klinis",
            "Latihan pernapasan dalam dan mindfulness",
            "Jaga pola tidur yang teratur",
            "Batasi konsumsi kafein dan alkohol",
            "Pertimbangkan Cognitive Behavioral Therapy (CBT)",
        ],
        "differentials": ["Panic Disorder", "Social Anxiety Disorder", "PTSD", "Hipertiroidisme"],
    },
]


class NLPModel:
    """
    Pluggable NLP model wrapper for RAPHA MEDICAL AI.

    Currently: DUMMY implementation.
    Replace `_load_model()` and `predict()` to use a real HuggingFace model.
    """

    def __init__(self, model_name: str = "dummy-v0.1"):
        self.model_name = model_name
        self._model = None
        self._load_model()
        logger.info(f"[NLPModel] Loaded model: {model_name}")

    def _load_model(self) -> None:
        """
        DUMMY: No model to load.

        REAL MODEL EXAMPLE:
        -------------------
        from transformers import pipeline
        self._model = pipeline(
            "text-classification",
            model=self.model_name,
            device=-1,  # CPU; set to 0 for GPU
        )
        """
        logger.info("[NLPModel] Using DUMMY model — swap in real HuggingFace model here.")
        self._model = None  # Not used in dummy mode

    def predict(self, text: str, language: str = "id") -> dict:
        """
        Run inference on patient narrative text.

        Args:
            text: Patient story / symptom narrative
            language: Language code ('id' for Indonesian, 'en' for English)

        Returns:
            dict with diagnosis, confidence, icd_code, recommendations, differentials

        REAL MODEL EXAMPLE:
        -------------------
        result = self._model(text, truncation=True, max_length=512)
        label = result[0]["label"]
        confidence = result[0]["score"]
        return self._map_label_to_response(label, confidence)
        """
        start = time.perf_counter()

        # ── DUMMY LOGIC ──────────────────────────────────────────────────────
        # Simulate processing delay (0.3 – 1.2 seconds)
        time.sleep(random.uniform(0.3, 1.2))

        # Pick a random diagnosis from the pool
        selected = random.choice(DUMMY_DIAGNOSES)
        confidence = round(random.uniform(*selected["confidence_range"]), 4)

        elapsed_ms = (time.perf_counter() - start) * 1000
        # ─────────────────────────────────────────────────────────────────────

        return {
            "diagnosis": selected["diagnosis"],
            "confidence": confidence,
            "icd_code": selected["icd_code"],
            "recommendations": selected["recommendations"],
            "differential_diagnoses": selected["differentials"],
            "processing_time_ms": round(elapsed_ms, 2),
        }


# ── Singleton instance (loaded once at startup) ───────────────────────────────
_model_instance: Optional[NLPModel] = None


def get_model() -> NLPModel:
    """Return the singleton NLPModel instance."""
    global _model_instance
    if _model_instance is None:
        from app.config import get_settings
        settings = get_settings()
        _model_instance = NLPModel(model_name=settings.MODEL_NAME)
    return _model_instance
