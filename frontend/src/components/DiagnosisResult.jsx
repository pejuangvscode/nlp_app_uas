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

      {/* Top 5 Predictions */}
      <div className="result-body">
        <h3 className="result-section-title">Top 5 Prediksi Penyakit</h3>
        <div className="predictions-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {result.top_predictions?.map((pred, i) => (
            <div key={i} className="prediction-item" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', background: 'var(--surface-2)', borderRadius: '8px',
              borderLeft: i === 0 ? '4px solid var(--primary)' : '4px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: i === 0 ? '600' : '500', color: i === 0 ? 'var(--text-1)' : 'var(--text-2)' }}>
                  {i + 1}. {pred.diagnosis}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '4px' }}>
                  ICD-10: <span style={{ fontFamily: 'monospace' }}>{pred.icd_code}</span>
                </div>
              </div>
              <div style={{
                fontWeight: '600',
                color: pred.confidence >= 0.85 ? 'var(--success)' : pred.confidence >= 0.5 ? 'var(--warning)' : 'var(--text-3)'
              }}>
                {Math.round(pred.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
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
