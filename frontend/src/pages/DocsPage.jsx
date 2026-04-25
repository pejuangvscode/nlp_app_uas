import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/* ── Copy-paste data ── */
const HEALTH_REQUEST  = `curl ${API_BASE_URL}/api/v1/health`;
const HEALTH_RESPONSE = `{
  "status": "healthy",
  "app_name": "RAPHA MEDICAL AI",
  "version": "1.0.0",
  "model_version": "dummy-v0.1"
}`;

const DIAGNOSE_REQUEST = `curl -X POST ${API_BASE_URL}/api/v1/diagnose \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{
    "patient_narrative": "Pasien perempuan 29 tahun mengeluh nyeri perut kanan bawah selama 8 jam.",
    "language": "id",
    "metadata": {
      "patient_age": 29,
      "patient_gender": "female",
      "source": "web_app"
    }
  }'`;

const DIAGNOSE_RESPONSE_200 = `{
  "request_id": "ff53819e-9dbf-4e6d-9343-4da257b21ca8",
  "diagnosis": "Appendicitis, unspecified",
  "confidence": 0.91,
  "icd_code": "K37",
  "recommendations": [
    "Segera konsultasi ke IGD untuk pemeriksaan fisik",
    "Lakukan pemeriksaan darah lengkap",
    "Pertimbangkan USG atau CT scan abdomen"
  ],
  "differential_diagnoses": [
    "Gastroenteritis",
    "Urinary tract infection"
  ],
  "model_version": "dummy-v0.1",
  "processing_time_ms": 512.4
}`;

const DIAGNOSE_RESPONSE_401 = `{ "detail": "API key required. Include 'X-API-Key' header." }`;
const DIAGNOSE_RESPONSE_403 = `{ "detail": "Invalid API key." }`;
const DIAGNOSE_RESPONSE_422 = `{
  "detail": [
    {
      "loc": ["body", "patient_narrative"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}`;

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
          API melakukan inferensi terhadap teks klinis dan mengembalikan diagnosis terstruktur
          dengan kode ICD-10, rekomendasi, dan skor kepercayaan.
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
            { label: 'cURL', code: HEALTH_REQUEST },
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
            diagnosis terstruktur, kode ICD-10, rekomendasi tindakan, dan diferensial diagnosis.
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
          <h3 className="result-section-title" style={{ marginBottom: 12 }}>Responses</h3>
          <TabsBlock tabs={[
            { label: 'cURL Example', code: DIAGNOSE_REQUEST },
            { label: '200 Success', code: DIAGNOSE_RESPONSE_200 },
            { label: '401 Unauthorized', code: DIAGNOSE_RESPONSE_401 },
            { label: '403 Forbidden', code: DIAGNOSE_RESPONSE_403 },
            { label: '422 Unprocessable', code: DIAGNOSE_RESPONSE_422 },
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
                <td>Hasil diagnosis utama dalam Bahasa Inggris (terminologi medis)</td>
              </tr>
              <tr>
                <td><span className="param-name">confidence</span></td>
                <td><span className="param-type">float (0–1)</span></td>
                <td>Skor kepercayaan model terhadap diagnosis</td>
              </tr>
              <tr>
                <td><span className="param-name">icd_code</span></td>
                <td><span className="param-type">string</span></td>
                <td>Kode ICD-10 yang sesuai dengan diagnosis</td>
              </tr>
              <tr>
                <td><span className="param-name">recommendations</span></td>
                <td><span className="param-type">string[]</span></td>
                <td>Daftar rekomendasi tindakan medis</td>
              </tr>
              <tr>
                <td><span className="param-name">differential_diagnoses</span></td>
                <td><span className="param-type">string[]</span></td>
                <td>Diagnosis banding yang perlu dipertimbangkan</td>
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
              { code: '401', cls: 's401', desc: 'API key wajib tapi tidak diberikan' },
              { code: '403', cls: 's403', desc: 'API key tidak valid atau expired' },
              { code: '422', cls: 's422', desc: 'Payload tidak valid atau field kurang' },
              { code: '500', cls: 's500', desc: 'Error internal di sisi model / server' },
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
