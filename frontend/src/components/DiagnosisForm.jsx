import { useState, useRef } from 'react';

const MAX_CHARS = 10000;
const MIN_CHARS = 10;

const PLACEHOLDER = `Contoh: Pasien laki-laki berusia 45 tahun datang dengan keluhan sakit kepala parah yang sudah berlangsung selama 3 hari. Nyeri terasa berdenyut di bagian kanan kepala, disertai mual, dan sensitif terhadap cahaya. Pasien juga mengalami demam ringan 37.8°C. Tidak ada riwayat hipertensi atau diabetes sebelumnya. Pasien saat ini bekerja di lingkungan dengan stres tinggi...`;

export default function DiagnosisForm({ onSubmit, isLoading }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

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
    <section className="form-card" aria-label="Form Input Diagnosis">
      <form onSubmit={handleSubmit} noValidate>
        <label className="form-label" htmlFor="patient-narrative">
          Cerita Pasien{' '}
          <span>(deskripsikan gejala, riwayat, dan kondisi secara detail)</span>
        </label>

        <div className="textarea-wrapper">
          <textarea
            id="patient-narrative"
            ref={textareaRef}
            className="form-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            disabled={isLoading}
            aria-describedby="char-count form-hint"
            aria-required="true"
            aria-label="Tulis cerita atau gejala pasien di sini"
            rows={7}
          />
          <div
            id="char-count"
            className={`char-count${isOverLimit ? ' warning' : ''}`}
            aria-live="polite"
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </div>
        </div>

        <div className="form-footer">
          <p id="form-hint" className="form-hint">
            Semakin detail cerita pasien, semakin akurat hasilnya
          </p>
          <button
            id="btn-diagnose"
            type="submit"
            className="btn-primary"
            disabled={!canSubmit}
            aria-label="Mulai analisis diagnosis AI"
          >
            Analisis Diagnosa
          </button>
        </div>
      </form>
    </section>
  );
}
