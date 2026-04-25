import { useState, useRef } from 'react';

const MAX_CHARS = 10000;
const MIN_CHARS = 10;

const SAMPLES = [
  {
    label: 'Nyeri perut kanan bawah',
    text: 'Pasien perempuan 29 tahun mengeluh nyeri perut kanan bawah sejak 8 jam lalu. Nyeri bersifat tajam dan menetap, disertai mual dan demam 38.1°C. Nafsu makan menurun. Tidak ada diare. Tidak ada riwayat operasi sebelumnya.',
  },
  {
    label: 'Sakit kepala berdenyut',
    text: 'Pasien laki-laki 42 tahun dengan keluhan sakit kepala berdenyut sebelah kanan sejak 3 hari. Intensitas sedang hingga berat, memburuk saat aktivitas. Disertai mual dan sensitif terhadap cahaya. Tidak ada demam.',
  },
  {
    label: 'Sesak napas & dada berat',
    text: 'Pasien perempuan 58 tahun dengan riwayat DM tipe 2 datang dengan sesak napas tiba-tiba dan rasa berat di dada sejak 1 jam. Keluar keringat dingin. TD 150/90 mmHg. Tidak ada batuk.',
  },
];

export default function DiagnosisForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSample = (sample) => {
    setText(sample.text);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed.length < MIN_CHARS || isLoading) return;
    onSubmit(trimmed);
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isUnderMin = text.trim().length < MIN_CHARS;
  const canSubmit = !isLoading && !isOverLimit && !isUnderMin;

  return (
    <div>
      {/* Sample prompts */}
      <div className="sample-prompts" aria-label="Contoh narasi pasien">
        <span className="sample-prompt-label">Coba:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            type="button"
            className="sample-chip"
            onClick={() => handleSample(s)}
            disabled={isLoading}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="form-label" htmlFor="patient-narrative">
          Cerita Pasien
        </label>

        <textarea
          id="patient-narrative"
          ref={textareaRef}
          className="form-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Deskripsikan gejala, riwayat, dan kondisi pasien secara detail…"
          disabled={isLoading}
          aria-describedby="char-count"
          aria-required="true"
          rows={8}
        />

        <div className="form-meta">
          <span className="form-hint">Semakin detail, semakin akurat hasilnya</span>
          <span
            id="char-count"
            className={`char-count${isOverLimit ? ' warn' : ''}`}
            aria-live="polite"
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        <button
          id="btn-diagnose"
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!canSubmit}
          aria-label="Mulai analisis diagnosis AI"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {isLoading ? 'Menganalisis…' : 'Analisis Diagnosa'}
        </button>
      </form>
    </div>
  );
}
