export default function LoadingSpinner() {
  return (
    <div className="loading-wrapper" role="status" aria-label="Menganalisis cerita pasien...">
      <div className="spinner-ring" aria-hidden="true" />
      <div className="loading-text">
        <strong>Menganalisis Cerita Pasien...</strong>
        <span>Model AI sedang memproses narasi Anda</span>
        <ul className="loading-steps" aria-hidden="true">
          {[
            '🔍 Parsing narasi pasien',
            '🧠 Menjalankan model NLP',
            '📊 Menghitung confidence score',
            '📋 Menyusun rekomendasi',
          ].map((step, i) => (
            <li
              key={i}
              className="loading-step active"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
