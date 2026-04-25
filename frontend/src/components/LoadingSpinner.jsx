export default function LoadingSpinner() {
  const steps = [
    'Parsing narasi pasien',
    'Menjalankan model NLP',
    'Menghitung confidence score',
    'Menyusun rekomendasi',
  ];

  return (
    <div className="loading-box" role="status" aria-label="Menganalisis cerita pasien…">
      <div className="spinner" aria-hidden="true" />
      <div>
        <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
          Menganalisis…
        </p>
        <ul className="loading-steps" aria-hidden="true">
          {steps.map((step, i) => (
            <li
              key={i}
              className="loading-step"
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
