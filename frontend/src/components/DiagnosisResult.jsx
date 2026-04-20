import { useEffect, useRef } from 'react';

export default function DiagnosisResult({ result, onReset }) {
  const cardRef = useRef(null);

  // Auto-scroll to result on first render
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const confidencePct = Math.round(result.confidence * 100);
  const confidenceLabel =
    confidencePct >= 85 ? 'Tinggi' : confidencePct >= 65 ? 'Sedang' : 'Rendah';

  return (
    <section
      ref={cardRef}
      className="result-card"
      aria-label="Hasil Diagnosis AI"
      role="region"
    >
      {/* ── Header ── */}
      <div className="result-header">
        <div className="result-header-left">
          <span className="result-label">🏥 Hasil Diagnosis AI</span>
          <h2 className="result-diagnosis">{result.diagnosis}</h2>
          <div className="result-icd">
            <span>Kode ICD-10:</span>
            <span className="icd-badge">{result.icd_code}</span>
          </div>
        </div>

        <div className="confidence-gauge" aria-label={`Tingkat kepercayaan: ${confidencePct}%`}>
          <span className="confidence-label">Confidence</span>
          <span className="confidence-value">{confidencePct}%</span>
          <div className="confidence-bar" role="progressbar" aria-valuenow={confidencePct} aria-valuemin={0} aria-valuemax={100}>
            <div className="confidence-fill" style={{ width: `${confidencePct}%` }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            {confidenceLabel}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="result-body">
        {/* Disclaimer */}
        <div className="disclaimer" role="alert">
          <span className="disclaimer-icon">⚠️</span>
          <span>
            Hasil ini adalah <strong>analisis AI</strong> untuk referensi awal dan{' '}
            <strong>bukan pengganti diagnosis dokter</strong>. Selalu konsultasikan dengan
            tenaga medis profesional untuk diagnosis dan penanganan definitif.
          </span>
        </div>

        {/* Recommendations */}
        {result.recommendations?.length > 0 && (
          <div>
            <h3 className="result-section-title">
              <span aria-hidden="true">📋</span> Rekomendasi Tindakan
            </h3>
            <ol className="recommendations-list" aria-label="Rekomendasi tindakan medis">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="recommendation-item">
                  <span className="rec-number" aria-hidden="true">{i + 1}</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Differential Diagnoses */}
        {result.differential_diagnoses?.length > 0 && (
          <div>
            <h3 className="result-section-title">
              <span aria-hidden="true">🔬</span> Diagnosis Banding
            </h3>
            <div className="differentials-list" aria-label="Kemungkinan diagnosis lain">
              {result.differential_diagnoses.map((d, i) => (
                <span key={i} className="differential-tag">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="result-footer">
        <div className="result-meta">
          <div className="meta-item">
            <span aria-hidden="true">⚡</span>
            <span>
              Waktu proses: <strong>{result.processing_time_ms?.toFixed(0)}ms</strong>
            </span>
          </div>
          <div className="meta-item">
            <span aria-hidden="true">🤖</span>
            <span>
              Model: <strong>{result.model_version}</strong>
            </span>
          </div>
          <div className="meta-item">
            <span aria-hidden="true">🔑</span>
            <span>
              ID: <strong style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {result.request_id?.slice(0, 8)}...
              </strong>
            </span>
          </div>
        </div>

        <button
          id="btn-reset"
          className="btn-reset"
          onClick={onReset}
          aria-label="Analisis kasus baru"
        >
          <span aria-hidden="true">↩</span> Analisis Baru
        </button>
      </div>
    </section>
  );
}
