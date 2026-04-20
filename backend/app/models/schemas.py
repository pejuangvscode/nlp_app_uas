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

class DiagnoseResponse(BaseModel):
    """
    Structured diagnosis response.
    
    Fields:
        request_id: Unique identifier for this request (for tracing)
        diagnosis: Primary diagnosis name
        confidence: Model confidence score (0.0 – 1.0)
        icd_code: ICD-10 code for the diagnosis
        recommendations: List of recommended next steps
        differential_diagnoses: Alternative possible diagnoses
        model_version: Version of the NLP model used
        processing_time_ms: Inference time in milliseconds
    """
    request_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique request ID for tracing",
    )
    diagnosis: str = Field(..., description="Primary diagnosis")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0-1)")
    icd_code: str = Field(..., description="ICD-10 diagnostic code")
    recommendations: list[str] = Field(
        default_factory=list,
        description="Recommended next steps",
    )
    differential_diagnoses: list[str] = Field(
        default_factory=list,
        description="Alternative possible diagnoses",
    )
    model_version: str = Field(..., description="Model version used for inference")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_version: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    request_id: Optional[str] = None
