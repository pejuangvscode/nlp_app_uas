from pydantic import BaseModel, Field
from typing import Optional, Any
import uuid


# ---------- Request Models ----------

class DiagnoseRequest(BaseModel):
    """
    Patient narrative diagnosis request.
    
    Fields:
        patient_narrative: The patient's story / symptoms in free text
        language: Language code of the narrative (ISO 639-1), default 'id' (Indonesian)
        metadata: Optional extensible metadata (e.g., patient age, gender, source system)
    """
    patient_narrative: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Patient's story / symptom description in free text",
        example="Pasien berumur 45 tahun mengeluhkan sakit kepala parah sejak 3 hari lalu, "
                "disertai demam tinggi dan mual. Tidak ada riwayat hipertensi sebelumnya.",
    )
    language: str = Field(
        default="id",
        description="Language code of the text (ISO 639-1). Supported: id, en",
        example="id",
    )
    metadata: Optional[dict[str, Any]] = Field(
        default=None,
        description="Optional metadata (patient age, gender, etc.)",
        example={"patient_age": 45, "patient_gender": "male", "source": "mobile_app"},
    )


# ---------- Response Models ----------

class Prediction(BaseModel):
    diagnosis: str
    icd_code: str
    confidence: float

class DiagnoseResponse(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    diagnosis: str = Field(...)
    confidence: float = Field(..., ge=0.0, le=1.0)
    icd_code: str = Field(...)
    top_predictions: list[Prediction] = Field(default_factory=list)
    model_version: str = Field(...)
    processing_time_ms: float = Field(...)


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_version: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    request_id: Optional[str] = None
