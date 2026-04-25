export default function Header({ swaggerUrl }) {
  return (
    <header className="header">
      <a className="header-brand" href="#testing-home" aria-label="RAPHA MEDICAL AI Home">
        <div className="header-logo" aria-hidden="true">RM</div>
        <div>
          <div className="header-name">RAPHA MEDICAL AI</div>
        </div>
        <span className="header-badge">Testing</span>
      </a>

      <nav className="header-nav" aria-label="Main navigation">
        <a href="#testing-home">Home</a>
        <a href="#playground">Playground</a>
        <a href="#api-reference">API Reference</a>
        <a href={swaggerUrl} target="_blank" rel="noreferrer">Swagger</a>
      </nav>
    </header>
  );
}
