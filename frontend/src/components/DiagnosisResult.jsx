import { useEffect, useRef } from 'react';

export default function DiagnosisResult({ result, onReset }) {
  const cardRef = useRef(null);

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const confidencePct = Math.round(result.confidence * 100);
  const confidenceLabel =
    confidencePct >= 85 ? 'Tinggi' : confidencePct >= 65 ? 'Sedang' : 'Rendah';

  return (
    <section ref={cardRef} className="result-card" aria-label="Hasil Diagnosis AI" role="region">
      {/* Header */}
      <div className="result-header">
        <div>
          <div className="result-eyebrow">
            <span className="result-dot" aria-hidden="true" />
            Hasil Diagnosis AI
          </div>
          <h2 className="result-diagnosis">{result.diagnosis}</h2>
          <div className="result-icd">
            <span>Kode ICD-10</span>
            <span className="icd-pill">{result.icd_code}</span>
          </div>
        </div>

        <div
          className="confidence-widget"
          aria-label={`Tingkat kepercayaan: ${confidencePct}%`}
        >
          <div className="confidence-number gradient-text">{confidencePct}%</div>
          <div className="confidence-bar-track">
            <div
              className="confidence-bar-fill"
              role="progressbar"
              aria-valuenow={confidencePct}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="confidence-label">Confidence · {confidenceLabel}</span>
        </div>
      </div>

      {/* Body */}
      <div className="result-body">
        {/* Disclaimer */}
        <div className="alert alert-warning" role="alert">
          <span>
            Hasil ini adalah <strong>analisis AI</strong> dan{' '}
            <strong>bukan pengganti diagnosis dokter</strong>. Selalu konsultasikan
            dengan tenaga medis profesional.
          </span>
        </div>

        {/* Recommendations */}
        {result.recommendations?.length > 0 && (
          <div>
            <h3 className="result-section-title">
              Rekomendasi Tindakan
            </h3>
            <ol className="rec-list" aria-label="Rekomendasi tindakan medis">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="rec-item">
                  <span className="rec-num" aria-hidden="true">{i + 1}</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Differential */}
        {result.differential_diagnoses?.length > 0 && (
          <div>
            <h3 className="result-section-title">
              Diagnosis Banding
            </h3>
            <div className="diff-tags" aria-label="Kemungkinan diagnosis lain">
              {result.differential_diagnoses.map((d, i) => (
                <span key={i} className="diff-tag">{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="result-footer">
        <div className="result-meta">
          <span className="meta-chip">
            Waktu proses: <strong>{result.processing_time_ms?.toFixed(0)}ms</strong>
          </span>
          <span className="meta-chip">
            Model: <strong>{result.model_version}</strong>
          </span>
          <span className="meta-chip">
            ID: <strong style={{ fontFamily: 'monospace', fontSize: '0.71rem' }}>{result.request_id?.slice(0, 8)}…</strong>
          </span>
        </div>

        <button
          id="btn-reset"
          className="btn btn-secondary btn-sm"
          onClick={onReset}
          aria-label="Analisis kasus baru"
        >
          Analisis Baru
        </button>
      </div>
    </section>
  );
}
