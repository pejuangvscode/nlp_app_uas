import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models.schemas import HealthResponse
from app.models.nlp_model import get_model
from app.routers import diagnose

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)
settings = get_settings()


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the NLP model at startup so the first request isn't slow."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    get_model()  # Warm up model singleton
    logger.info("Model loaded — ready to serve requests")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## RAPHA MEDICAL AI — Clinical NLP API

Convert patient narratives (free-text stories) into structured medical diagnoses.

### Features
- 🏥 **Patient narrative → Diagnosis** with ICD-10 codes
- 🔑 **API Key authentication** (enabled via `REQUIRE_API_KEY=true`)
- 🌐 **Multi-language** (Indonesian 🇮🇩 & English 🇬🇧)
- 📊 **Confidence scoring** and **differential diagnoses**
- ⚡ **Sub-second inference** (GPU-ready)

### API Versioning
All endpoints are versioned under `/api/v1/`.

### Authentication
When API key auth is enabled, include the header:
```
X-API-Key: your-api-key-here
```
    """,
    contact={
        "name": "RAPHA MEDICAL AI Team",
        "email": "api@rapha-medical.ai",
    },
    license_info={
        "name": "Proprietary",
    },
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(diagnose.router, prefix=settings.API_PREFIX)


# ── Health Check ─────────────────────────────────────────────────────────────
@app.get(
    f"{settings.API_PREFIX}/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="Health check",
    description="Returns service health status. Use this for uptime monitoring.",
)
async def health_check() -> HealthResponse:
    model = get_model()
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        model_version=model.model_name,
    )


@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health",
        "version": settings.APP_VERSION,
    }
