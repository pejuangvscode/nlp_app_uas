import { useState } from 'react';
import Header from './components/Header';
import DiagnosisForm from './components/DiagnosisForm';
import DiagnosisResult from './components/DiagnosisResult';
import LoadingSpinner from './components/LoadingSpinner';
import { diagnosePatient, ApiError } from './services/api';

export default function App() {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'result' | 'error'
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
    <div className="app">
      <Header />

      <main className="main-content" id="main-content">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-eyebrow">
            <span className="dot" aria-hidden="true" />
            Clinical NLP · AI-Powered · ICD-10
          </div>
          <h1 id="hero-title">
            Diagnosis Penyakit{' '}
            <span className="gradient-text">Berbasis AI</span>
            <br />
            dari Cerita Pasien
          </h1>
          <p className="hero-description">
            Masukkan narasi atau cerita pasien secara detail. RAPHA MEDICAL AI akan
            menganalisis gejala dan menghasilkan diagnosis beserta rekomendasi tindakan
            secara instan.
          </p>
        </section>

        {/* Form — always visible unless result is showing */}
        {state !== 'result' && (
          <DiagnosisForm
            onSubmit={handleSubmit}
            isLoading={state === 'loading'}
          />
        )}

        {/* Loading */}
        {state === 'loading' && <LoadingSpinner />}

        {/* Error */}
        {state === 'error' && (
          <div className="error-box" role="alert" aria-live="assertive">
            <span aria-hidden="true">❌</span>
            <div>
              <strong>Analisis Gagal: </strong>{error}
              <br />
              <button
                id="btn-retry"
                onClick={handleReset}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  padding: 0,
                }}
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {state === 'result' && result && (
          <DiagnosisResult result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} RAPHA MEDICAL AI · For educational &amp; clinical decision support only ·{' '}
          <a href="/docs" target="_blank" rel="noopener noreferrer">API Docs</a>
        </p>
      </footer>
    </div>
  );
}
