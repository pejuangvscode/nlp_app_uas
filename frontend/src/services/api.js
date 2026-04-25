/**
 * RAPHA MEDICAL AI — API Service
 *
 * Centralized, reusable API client.
 * Update VITE_API_BASE_URL in .env (or Vercel env vars) to point to your Fly.io backend.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rapha-medical-ai-backend.fly.dev';
const API_VERSION = '/api/v1';

/**
 * Core fetch wrapper with error handling, timeout, and optional API key.
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${API_VERSION}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s timeout

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Optional: include API key if stored (for future monetization use)
  const apiKey = localStorage.getItem('rapha_api_key');
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.detail || data.error || `HTTP ${response.status}`,
        response.status,
        data,
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }

    if (error instanceof ApiError) throw error;

    throw new ApiError(
      'Cannot connect to the server. Please check your connection.',
      0,
    );
  }
}

/**
 * Custom API error class with status code.
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  RAPHA API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/diagnose
 *
 * Send a patient narrative and receive a structured diagnosis.
 *
 * @param {Object} params
 * @param {string} params.patient_narrative - Patient's story in free text
 * @param {string} [params.language='id'] - Language code ('id' | 'en')
 * @param {Object} [params.metadata] - Optional metadata (age, gender, etc.)
 *
 * @returns {Promise<DiagnoseResponse>}
 */
export async function diagnosePatient({ patient_narrative, language = 'id', metadata = null }) {
  return apiFetch('/diagnose', {
    method: 'POST',
    body: JSON.stringify({
      patient_narrative,
      language,
      ...(metadata && { metadata }),
    }),
  });
}

/**
 * GET /api/v1/health
 *
 * Check backend service health.
 *
 * @returns {Promise<HealthResponse>}
 */
export async function checkHealth() {
  return apiFetch('/health');
}
