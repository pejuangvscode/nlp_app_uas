export default function Header() {
  return (
    <header className="header">
      <a className="header-brand" href="/" aria-label="RAPHA MEDICAL AI Home">
        <div className="header-logo" aria-hidden="true">⚕️</div>
        <div>
          <div className="header-name">RAPHA MEDICAL AI</div>
        </div>
        <span className="header-badge">Beta</span>
      </a>

      <nav className="header-nav" aria-label="Status">
        <div className="header-status" role="status" aria-live="polite">
          <span className="status-dot" aria-hidden="true" />
          <span>AI Online</span>
        </div>
      </nav>
    </header>
  );
}
