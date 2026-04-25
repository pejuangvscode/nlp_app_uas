import { useState } from 'react';
import { Link } from 'react-router-dom';
import DiagnosisForm from '../components/DiagnosisForm';
import DiagnosisResult from '../components/DiagnosisResult';
import LoadingSpinner from '../components/LoadingSpinner';
import CodeBlock from '../components/CodeBlock';
import { diagnosePatient, ApiError } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rapha-medical-ai-backend.fly.dev';

const REQUEST_EXAMPLE = `{
  "patient_narrative": "Pasien perempuan 29 tahun mengeluh nyeri perut kanan bawah...",
  "language": "id",
  "metadata": {
    "patient_age": 29,
    "patient_gender": "female"
  }
}`;

const RESPONSE_EXAMPLE = `{
  "request_id": "ff53819e-9dbf-4e6d-9343-4da257b21ca8",
  "diagnosis": "Appendicitis, unspecified",
  "confidence": 0.91,
  "icd_code": "K37",
  "recommendations": [
    "Segera konsultasi ke IGD untuk pemeriksaan fisik",
    "Lakukan pemeriksaan darah lengkap"
  ],
  "differential_diagnoses": ["Gastroenteritis", "UTI"],
  "model_version": "dummy-v0.1",
  "processing_time_ms": 512.4
}`;

export default function TryPage() {
  const [state, setState] = useState('idle'); // idle | loading | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (patientNarrative) => {
    setState('loading');
    setError(null);
    setResult(null);
    try {
      const data = await diagnosePatient({ patient_narrative: patientNarrative });
      setResult(data);
      setState('result');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Terjadi kesalahan tidak terduga. Silakan coba lagi.';
      setError(message);
      setState('error');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError(null);
  };

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero container" aria-labelledby="hero-title">
        <h1 className="hero-title" id="hero-title">
          Clinical Intelligence API{' '}
          <span className="gradient-text">untuk Faskes Modern</span>
        </h1>
        <p className="hero-desc">
          Integrasikan kapabilitas Natural Language Processing ke dalam sistem rekam medis Anda. 
          Ekstrak narasi klinis menjadi diagnosis terstruktur dan kode ICD-10 dalam hitungan milidetik.
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary btn-lg" href="#playground">
            Live Playground
          </a>
          <Link className="btn btn-secondary btn-lg" to="/docs">
            Dokumentasi API
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">POST</span>
            <span className="stat-label">/api/v1/diagnose</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">ICD-10</span>
            <span className="stat-label">Kode diagnosis</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">&lt;1s</span>
            <span className="stat-label">Waktu inference</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Bahasa ID</span>
            <span className="stat-label">Native support</span>
          </div>
        </div>
      </section>

      {/* Playground */}
      <section className="playground container" id="playground" aria-labelledby="playground-title">
        <div className="playground-grid">
          {/* Left: form / loading / result */}
          <div>
            <div className="playground-header">
              <h2 className="playground-title" id="playground-title">Testing Playground</h2>
              <p className="playground-sub">
                Input cerita pasien untuk menjalankan inference model NLP secara real-time
              </p>
            </div>

            {state !== 'result' && (
              <DiagnosisForm onSubmit={handleSubmit} isLoading={state === 'loading'} />
            )}

            {state === 'loading' && <LoadingSpinner />}

            {state === 'error' && (
              <div className="error-box" role="alert" aria-live="assertive">

                <div>
                  <strong>Analisis gagal:</strong> {error}
                  <br />
                  <button className="text-link" onClick={handleReset} style={{ marginTop: 6 }}>
                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {state === 'result' && result && (
              <DiagnosisResult result={result} onReset={handleReset} />
            )}
          </div>

          {/* Right: reference payload */}
          <aside className="console-panel" aria-label="Contoh payload API">
            <div className="console-card">
              <div className="console-header">
                <div className="console-dots" aria-hidden="true">
                  <span className="console-dot" />
                  <span className="console-dot" />
                  <span className="console-dot" />
                </div>
                <span className="console-title">Request</span>
              </div>
              <div className="console-body">
                <CodeBlock code={REQUEST_EXAMPLE} />
              </div>
            </div>

            <div className="console-card">
              <div className="console-header">
                <div className="console-dots" aria-hidden="true">
                  <span className="console-dot" />
                  <span className="console-dot" />
                  <span className="console-dot" />
                </div>
                <span className="console-title">Response</span>
              </div>
              <div className="console-body">
                <CodeBlock code={RESPONSE_EXAMPLE} />
              </div>
            </div>

            {/* Quick link to docs */}
            <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginBottom: 12 }}>
                Butuh dokumentasi lengkap?
              </p>
              <Link className="btn btn-secondary btn-sm" to="/docs" style={{ width: '100%', justifyContent: 'center' }}>
                Buka API Docs
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} RAPHA MEDICAL AI · Untuk keperluan edukasi dan pendukung keputusan klinis ·{' '}
          <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noreferrer">Swagger UI</a>
        </p>
      </footer>
    </div>
  );
}
