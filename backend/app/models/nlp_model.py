"""
NLP Model Layer — HuggingFace API Client
==========================================

This module sends patient text to a model hosted on HuggingFace Inference API.
It allows the backend to remain extremely lightweight while the heavy processing
is done on HuggingFace servers.
"""

import time
import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  Label Mapping (USER MUST UPDATE THIS)
LABEL_MAP = {
    0: {"diagnosis": "Influenza", "icd_code": "DIS-001", "recommendations": [], "differentials": []},
    1: {"diagnosis": "Faringitis Akut", "icd_code": "DIS-002", "recommendations": [], "differentials": []},
    2: {"diagnosis": "Tonsilitis Akut", "icd_code": "DIS-003", "recommendations": [], "differentials": []},
    3: {"diagnosis": "Asma Bronkial", "icd_code": "DIS-004", "recommendations": [], "differentials": []},
    4: {"diagnosis": "Bronkitis Akut", "icd_code": "DIS-005", "recommendations": [], "differentials": []},
    5: {"diagnosis": "Pneumonia", "icd_code": "DIS-006", "recommendations": [], "differentials": []},
    6: {"diagnosis": "TB Paru", "icd_code": "DIS-007", "recommendations": [], "differentials": []},
    7: {"diagnosis": "Rhinitis Alergika", "icd_code": "DIS-008", "recommendations": [], "differentials": []},
    8: {"diagnosis": "Gastritis", "icd_code": "DIS-009", "recommendations": [], "differentials": []},
    9: {"diagnosis": "Konstipasi / Sembelit", "icd_code": "DIS-010", "recommendations": [], "differentials": []},
    10: {"diagnosis": "Gastroenteritis / Diare Akut", "icd_code": "DIS-011", "recommendations": [], "differentials": []},
    11: {"diagnosis": "Demam Tifoid", "icd_code": "DIS-012", "recommendations": [], "differentials": []},
    12: {"diagnosis": "Hemoroid Grade 1-2", "icd_code": "DIS-013", "recommendations": [], "differentials": []},
    13: {"diagnosis": "Disentri", "icd_code": "DIS-014", "recommendations": [], "differentials": []},
    14: {"diagnosis": "IBS / Irritable Bowel Syndrome", "icd_code": "DIS-015", "recommendations": [], "differentials": []},
    15: {"diagnosis": "Hepatitis A", "icd_code": "DIS-016", "recommendations": [], "differentials": []},
    16: {"diagnosis": "Hipertensi Esensial", "icd_code": "DIS-017", "recommendations": [], "differentials": []},
    17: {"diagnosis": "Diabetes Melitus Tipe 2", "icd_code": "DIS-018", "recommendations": [], "differentials": []},
    18: {"diagnosis": "Dislipidemia", "icd_code": "DIS-019", "recommendations": [], "differentials": []},
    19: {"diagnosis": "Hiperurisemia / Artritis Gout", "icd_code": "DIS-020", "recommendations": [], "differentials": []},
    20: {"diagnosis": "Obesitas", "icd_code": "DIS-021", "recommendations": [], "differentials": []},
    21: {"diagnosis": "Anemia Defisiensi Besi", "icd_code": "DIS-022", "recommendations": [], "differentials": []},
    22: {"diagnosis": "Tinea Corporis/Cruris (Dermatofitosis)", "icd_code": "DIS-023", "recommendations": [], "differentials": []},
    23: {"diagnosis": "Skabies", "icd_code": "DIS-024", "recommendations": [], "differentials": []},
    24: {"diagnosis": "Dermatitis Atopik", "icd_code": "DIS-025", "recommendations": [], "differentials": []},
    25: {"diagnosis": "Dermatitis Kontak Iritan", "icd_code": "DIS-026", "recommendations": [], "differentials": []},
    26: {"diagnosis": "Urtikaria Akut", "icd_code": "DIS-027", "recommendations": [], "differentials": []},
    27: {"diagnosis": "Akne Vulgaris", "icd_code": "DIS-028", "recommendations": [], "differentials": []},
    28: {"diagnosis": "Varisela", "icd_code": "DIS-029", "recommendations": [], "differentials": []},
    29: {"diagnosis": "Herpes Zoster", "icd_code": "DIS-030", "recommendations": [], "differentials": []},
    30: {"diagnosis": "Impetigo / Pioderma", "icd_code": "DIS-031", "recommendations": [], "differentials": []},
    31: {"diagnosis": "Konjungtivitis", "icd_code": "DIS-032", "recommendations": [], "differentials": []},
    32: {"diagnosis": "Hordeolum", "icd_code": "DIS-033", "recommendations": [], "differentials": []},
    33: {"diagnosis": "Mata Kering", "icd_code": "DIS-034", "recommendations": [], "differentials": []},
    34: {"diagnosis": "Otitis Eksterna", "icd_code": "DIS-035", "recommendations": [], "differentials": []},
    35: {"diagnosis": "Otitis Media Akut", "icd_code": "DIS-036", "recommendations": [], "differentials": []},
    36: {"diagnosis": "Blefaritis", "icd_code": "DIS-037", "recommendations": [], "differentials": []},
    37: {"diagnosis": "Demam Dengue / DBD", "icd_code": "DIS-038", "recommendations": [], "differentials": []},
    38: {"diagnosis": "Kecacingan / Helminthiasis", "icd_code": "DIS-039", "recommendations": [], "differentials": []},
    39: {"diagnosis": "Alergi Makanan / Food Allergy", "icd_code": "DIS-040", "recommendations": [], "differentials": []},
    40: {"diagnosis": "Morbili / Campak", "icd_code": "DIS-041", "recommendations": [], "differentials": []},
    41: {"diagnosis": "Parotitis", "icd_code": "DIS-042", "recommendations": [], "differentials": []},
    42: {"diagnosis": "ISK / Pielonefritis", "icd_code": "DIS-043", "recommendations": [], "differentials": []},
    43: {"diagnosis": "Dismenore / Nyeri Haid", "icd_code": "DIS-044", "recommendations": [], "differentials": []},
    44: {"diagnosis": "Vaginosis Bakterialis", "icd_code": "DIS-045", "recommendations": [], "differentials": []},
    45: {"diagnosis": "Gonore", "icd_code": "DIS-046", "recommendations": [], "differentials": []},
    46: {"diagnosis": "Fimosis", "icd_code": "DIS-047", "recommendations": [], "differentials": []},
    47: {"diagnosis": "Bell's Palsy", "icd_code": "DIS-048", "recommendations": [], "differentials": []},
    48: {"diagnosis": "Migren", "icd_code": "DIS-049", "recommendations": [], "differentials": []},
    49: {"diagnosis": "Vertigo / BPPV", "icd_code": "DIS-050", "recommendations": [], "differentials": []},
}

class NLPModel:
    """
    Pluggable NLP model wrapper for RAPHA MEDICAL AI.
    Connects to HuggingFace Inference API.
    """

    def __init__(self, hf_api_url: str, hf_api_token: str):
        self.api_url = hf_api_url
        self.api_token = hf_api_token
        self.model_name = "hf-inference-api"
        logger.info(f"[NLPModel] Initialized HuggingFace Client pointing to: {self.api_url}")

    def predict(self, text: str, language: str = "id") -> dict:
        """
        Send text to HuggingFace Inference API.
        """
        start = time.perf_counter()

        if not self.api_url or self.api_url == "https://api-inference.huggingface.co/models/your-username/your-model":
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.warning("[NLPModel] HF_API_URL is not configured! Returning fallback.")
            return {
                "diagnosis": "Configuration Missing",
                "confidence": 0.0,
                "icd_code": "ERR",
                "recommendations": ["Silakan set HF_API_URL di backend (.env atau fly.toml)"],
                "differential_diagnoses": [],
                "processing_time_ms": round(elapsed_ms, 2),
            }

        headers = {"Content-Type": "application/json"}
        if self.api_token:
            headers["Authorization"] = f"Bearer {self.api_token}"

        payload = {
            "inputs": text,
            "parameters": {
                "truncation": True,
                "max_length": 512
            }
        }

        try:
            logger.info("[NLPModel] Sending request to HuggingFace API...")
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            
            result = response.json()
            
            # HuggingFace typically returns a list of list of dicts: [[{"label": "LABEL_0", "score": 0.9}]]
            if isinstance(result, list) and len(result) > 0:
                if isinstance(result[0], list):
                    top_prediction = result[0][0]
                else:
                    top_prediction = result[0]
                
                label_str = top_prediction.get("label", "0")
                confidence_val = top_prediction.get("score", 0.0)
                
                # Extract integer from "LABEL_X" or just parse integer
                try:
                    pred_idx = int(''.join(filter(str.isdigit, str(label_str))))
                except ValueError:
                    pred_idx = 0
            else:
                raise ValueError("Unexpected API response format")

        except Exception as e:
            logger.error(f"[NLPModel] HuggingFace API Error: {str(e)}")
            elapsed_ms = (time.perf_counter() - start) * 1000
            return {
                "diagnosis": "API Connection Error",
                "confidence": 0.0,
                "icd_code": "ERR",
                "recommendations": [f"Gagal menghubungi model di HuggingFace: {str(e)}"],
                "differential_diagnoses": [],
                "processing_time_ms": round(elapsed_ms, 2),
            }

        # Map index to actual disease info
        disease_info = LABEL_MAP.get(pred_idx, LABEL_MAP[0])

        elapsed_ms = (time.perf_counter() - start) * 1000

        return {
            "diagnosis": disease_info["diagnosis"],
            "confidence": round(confidence_val, 4),
            "icd_code": disease_info["icd_code"],
            "recommendations": disease_info["recommendations"],
            "differential_diagnoses": disease_info["differentials"],
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
        _model_instance = NLPModel(
            hf_api_url=settings.HF_API_URL,
            hf_api_token=settings.HF_API_TOKEN
        )
    return _model_instance
