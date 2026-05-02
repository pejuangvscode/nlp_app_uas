import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rapha-medical-ai-backend.fly.dev';

/* ── Copy-paste data ── */
const HEALTH_CURL  = `curl ${API_BASE_URL}/api/v1/health`;
const HEALTH_PWSH  = `Invoke-RestMethod -Uri "${API_BASE_URL}/api/v1/health" -Method GET`;
const HEALTH_RESPONSE = `{
  "status": "healthy",
  "app_name": "RAPHA MEDICAL AI",
  "version": "1.0.0",
  "model_version": "rapha-bert-multihead-v1"
}`;

const DIAGNOSE_CURL = `curl -X POST ${API_BASE_URL}/api/v1/diagnose ^
  -H "Content-Type: application/json" ^
  -d "{\\"patient_narrative\\": \\"Pasien perempuan 29 tahun mengeluh nyeri perut kanan bawah selama 8 jam.\\",\\"language\\":\\"id\\"}"`;

const DIAGNOSE_PWSH = `$body = @{
    patient_narrative = "Pasien perempuan 29 tahun mengeluh nyeri perut kanan bawah selama 8 jam."
    language          = "id"
    metadata          = @{ patient_age = 29; patient_gender = "female" }
} | ConvertTo-Json

Invoke-RestMethod \`
    -Uri "${API_BASE_URL}/api/v1/diagnose" \`
    -Method POST \`
    -ContentType "application/json" \`
    -Body $body`;

const DIAGNOSE_RESPONSE_200 = `{
  "request_id": "ff53819e-9dbf-4e6d-9343-4da257b21ca8",
  "diagnosis": "Gastritis",
  "confidence": 0.62,
  "icd_code": "DIS-009",
  "top_predictions": [
    { "diagnosis": "Gastritis",          "icd_code": "DIS-009", "confidence": 0.62 },
    { "diagnosis": "Demam Tifoid",        "icd_code": "DIS-012", "confidence": 0.18 },
    { "diagnosis": "Gastroenteritis",    "icd_code": "DIS-011", "confidence": 0.09 },
    { "diagnosis": "IBS",               "icd_code": "DIS-015", "confidence": 0.06 },
    { "diagnosis": "Hemoroid Grade 1-2", "icd_code": "DIS-013", "confidence": 0.02 }
  ],
  "model_version": "rapha-bert-multihead-v1",
  "processing_time_ms": 1842.3
}`;

const DIAGNOSE_RESPONSE_422 = `{
  "detail": [
    {
      "loc": ["body", "patient_narrative"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}`;

const DIAGNOSE_RESPONSE_503 = `{ "detail": "Model not loaded. HuggingFace Space may still be starting up." }`;

const AUTH_HEADER = `X-API-Key: your-api-key-here`;

const sections = [
  { id: 'overview',      label: 'Overview' },
  { id: 'authentication',label: 'Authentication' },
  { id: 'health',        label: 'GET /health' },
  { id: 'diagnose',      label: 'POST /diagnose' },
  { id: 'status-codes',  label: 'Status Codes' },
];

/* ── Tabs helper ── */
function TabsBlock({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div className="console-card" style={{ margin: '1rem 0' }}>
      <div className="response-tabs" role="tablist">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            className={`response-tab${active === i ? ' active' : ''}`}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-panel" role="tabpanel">
        <CodeBlock code={tabs[active].code} />
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="docs-layout" id="docs-top">
      {/* Sidebar */}
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        <div className="sidebar-section">
          <div className="sidebar-label">Reference</div>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="sidebar-link"
            >
              {s.label}
            </a>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-label">External</div>
          <a
            className="sidebar-link"
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noreferrer"
          >
            Swagger UI
          </a>
          <a
            className="sidebar-link"
            href={`${API_BASE_URL}/openapi.json`}
            target="_blank"
            rel="noreferrer"
          >
            OpenAPI JSON
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="docs-content">
        <h1 className="docs-page-title" id="overview">API Reference</h1>
        <p className="docs-page-desc">
          RAPHA MEDICAL AI menyediakan REST API untuk analisis narasi pasien berbasis NLP.
          API melakukan inferensi terhadap teks klinis dan mengembalikan Top-5 prediksi diagnosis
          dengan kode ICD-10 dan skor kepercayaan masing-masing.
        </p>

        {/* Base URL */}
        <div className="docs-section">
          <h2 className="docs-section-title" id="base-url">Base URL</h2>
          <div className="endpoint-url">
            <span className="badge badge-get">Base</span>
            <span>{API_BASE_URL}</span>
          </div>
          <p className="docs-section-desc">
            Semua endpoint berada di bawah path <code>/api/v1</code>. Gunakan HTTPS di
            environment production.
          </p>
        </div>

        <div className="divider" />

        {/* Authentication */}
        <div className="docs-section" id="authentication" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <h2 className="docs-section-title">
            <span className="badge badge-auth">Auth</span>
            Authentication
          </h2>
          <p className="docs-section-desc">
            Jika backend dikonfigurasi dengan <code>REQUIRE_API_KEY=true</code>, setiap
            request ke endpoint terproteksi harus menyertakan API key di header:
          </p>
          <CodeBlock code={AUTH_HEADER} />
          <p className="docs-section-desc" style={{ marginTop: 12, marginBottom: 0 }}>
            Jika tidak ada API key yang dikonfigurasi (default development), header ini
            bersifat opsional dan dapat diabaikan.
          </p>
        </div>

        <div className="divider" />

        {/* Health */}
        <div className="docs-section" id="health" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <h2 className="docs-section-title">
            <span className="badge badge-get">GET</span>
            /api/v1/health
          </h2>
          <p className="docs-section-desc">
            Cek status backend service, versi aplikasi, dan versi model yang sedang berjalan.
            Endpoint ini tidak membutuhkan autentikasi.
          </p>

          <div className="endpoint-url">
            <span className="badge badge-get">GET</span>
            <span>{API_BASE_URL}/api/v1/health</span>
          </div>

          <TabsBlock tabs={[
            { label: 'cURL (Mac/Linux)', code: HEALTH_CURL },
            { label: 'PowerShell (Windows)', code: HEALTH_PWSH },
            { label: '200 OK', code: HEALTH_RESPONSE },
          ]} />
        </div>

        <div className="divider" />

        {/* Diagnose */}
        <div className="docs-section" id="diagnose" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <h2 className="docs-section-title">
            <span className="badge badge-post">POST</span>
            /api/v1/diagnose
          </h2>
          <p className="docs-section-desc">
            Endpoint utama. Menerima narasi pasien dalam bahasa natural dan mengembalikan
            Top-5 prediksi diagnosis terstruktur beserta kode ICD-10 dan skor kepercayaan masing-masing.
          </p>

          <div className="endpoint-url">
            <span className="badge badge-post">POST</span>
            <span>{API_BASE_URL}/api/v1/diagnose</span>
          </div>

          {/* Request body */}
          <h3 className="result-section-title" style={{ marginBottom: 12 }}>Request Body</h3>
          <table className="params-table" aria-label="Request body parameters">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="param-name">patient_narrative</span></td>
                <td><span className="param-type">string</span></td>
                <td><span className="param-req req">Wajib</span></td>
                <td>Narasi/cerita pasien (10–10.000 karakter)</td>
              </tr>
              <tr>
                <td><span className="param-name">language</span></td>
                <td><span className="param-type">string</span></td>
                <td><span className="param-req opt">Opsional</span></td>
                <td>Kode bahasa. Default: <code>id</code></td>
              </tr>
              <tr>
                <td><span className="param-name">metadata</span></td>
                <td><span className="param-type">object</span></td>
                <td><span className="param-req opt">Opsional</span></td>
                <td>Data tambahan: <code>patient_age</code>, <code>patient_gender</code>, <code>source</code></td>
              </tr>
            </tbody>
          </table>

          {/* Response tabs */}
          <h3 className="result-section-title" style={{ marginBottom: 4, marginTop: 24 }}>Request Examples & Responses</h3>
          <p className="docs-section-desc" style={{ marginBottom: 8 }}>
            Pilih tab sesuai OS Anda. Pengguna Windows gunakan tab <strong>PowerShell</strong>.
          </p>
          <TabsBlock tabs={[
            { label: 'cURL (Mac/Linux)', code: DIAGNOSE_CURL },
            { label: 'PowerShell (Windows)', code: DIAGNOSE_PWSH },
            { label: '200 Success', code: DIAGNOSE_RESPONSE_200 },
            { label: '422 Unprocessable', code: DIAGNOSE_RESPONSE_422 },
            { label: '503 Unavailable', code: DIAGNOSE_RESPONSE_503 },
          ]} />

          {/* Response fields */}
          <h3 className="result-section-title" style={{ marginTop: 24, marginBottom: 12 }}>Response Fields</h3>
          <table className="params-table" aria-label="Response body fields">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="param-name">request_id</span></td>
                <td><span className="param-type">string (UUID)</span></td>
                <td>Identifier unik untuk request ini</td>
              </tr>
              <tr>
                <td><span className="param-name">diagnosis</span></td>
                <td><span className="param-type">string</span></td>
                <td>Hasil diagnosis utama (prediksi teratas)</td>
              </tr>
              <tr>
                <td><span className="param-name">confidence</span></td>
                <td><span className="param-type">float (0–1)</span></td>
                <td>Skor kepercayaan model terhadap diagnosis utama</td>
              </tr>
              <tr>
                <td><span className="param-name">icd_code</span></td>
                <td><span className="param-type">string</span></td>
                <td>Kode ICD diagnosis utama</td>
              </tr>
              <tr>
                <td><span className="param-name">top_predictions</span></td>
                <td><span className="param-type">object[]</span></td>
                <td>Top-5 prediksi penyakit. Setiap objek berisi <code>diagnosis</code>, <code>icd_code</code>, dan <code>confidence</code></td>
              </tr>
              <tr>
                <td><span className="param-name">model_version</span></td>
                <td><span className="param-type">string</span></td>
                <td>Versi model NLP yang digunakan</td>
              </tr>
              <tr>
                <td><span className="param-name">processing_time_ms</span></td>
                <td><span className="param-type">float</span></td>
                <td>Waktu proses inference dalam milisecond</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="divider" />

        {/* Status Codes */}
        <div className="docs-section" id="status-codes" style={{ scrollMarginTop: 'calc(var(--nav-h) + 24px)' }}>
          <h2 className="docs-section-title">Status Codes</h2>
          <p className="docs-section-desc">HTTP status codes yang dikembalikan oleh API.</p>
          <div className="status-grid">
            {[
              { code: '200', cls: 's200', desc: 'Request berhasil diproses' },
              { code: '422', cls: 's422', desc: 'Payload tidak valid atau field kurang' },
              { code: '500', cls: 's500', desc: 'Error internal di sisi model / server' },
              { code: '503', cls: 's500', desc: 'Model belum siap — HuggingFace Space sedang start up' },
              { code: '408', cls: 's422', desc: 'Request timeout (>30 detik)' },
            ].map((s) => (
              <div key={s.code} className="status-item">
                <span className={`status-code ${s.cls}`}>{s.code}</span>
                <span className="status-desc">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <footer className="footer" style={{ marginTop: 40, textAlign: 'left', padding: '24px 0' }}>
          <p>
            © {new Date().getFullYear()} RAPHA MEDICAL AI · Untuk keperluan edukasi dan pendukung keputusan klinis
          </p>
        </footer>
      </main>
    </div>
  );
}
