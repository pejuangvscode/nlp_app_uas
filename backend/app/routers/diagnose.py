import uuid
import time
import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.models.schemas import DiagnoseRequest, DiagnoseResponse, ErrorResponse
from app.models.nlp_model import get_model
from app.middleware.auth import verify_api_key

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/diagnose",
    tags=["Diagnosis"],
    responses={
        401: {"model": ErrorResponse, "description": "API key missing"},
        403: {"model": ErrorResponse, "description": "Invalid API key"},
        422: {"description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)


@router.post(
    "",
    response_model=DiagnoseResponse,
    summary="Diagnose patient from narrative",
    description="""
    Accepts a patient's story / symptom narrative in free text and returns a structured medical diagnosis.

    **Input**: Free text patient narrative (supports Indonesian and English)

    **Output**:
    - Primary diagnosis with ICD-10 code
    - Confidence score (0.0 – 1.0)
    - Recommended next steps
    - Differential diagnoses
    - Request ID for tracing

    **Authentication**: Pass `X-API-Key` header if API key auth is enabled.
    """,
)
async def diagnose_patient(
    request: DiagnoseRequest,
    _: str | None = Depends(verify_api_key),
) -> DiagnoseResponse:
    """
    POST /api/v1/diagnose

    Runs NLP model inference on the patient narrative and returns a diagnosis.
    """
    request_id = str(uuid.uuid4())
    logger.info(f"[{request_id}] New diagnosis request | lang={request.language} | chars={len(request.patient_narrative)}")

    try:
        model = get_model()
        result = model.predict(
            text=request.patient_narrative,
            language=request.language,
        )

        response = DiagnoseResponse(
            request_id=request_id,
            model_version=model.model_name,
            **result,
        )

        logger.info(
            f"[{request_id}] Diagnosis complete | "
            f"diagnosis='{response.diagnosis}' | "
            f"confidence={response.confidence} | "
            f"time={response.processing_time_ms}ms"
        )
        return response

    except Exception as e:
        logger.error(f"[{request_id}] Inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {str(e)}",
        )
