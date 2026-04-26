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
# ─────────────────────────────────────────────
# Update this dictionary with your actual 50 diseases, ICD codes, and recommendations.
LABEL_MAP = {
    i: {
        "diagnosis": f"Predicted Disease {i}",
        "icd_code": f"UNK-{i}",
        "recommendations": ["Konsultasikan ke dokter untuk pemeriksaan lebih lanjut."],
        "differentials": []
    }
    for i in range(50)
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
