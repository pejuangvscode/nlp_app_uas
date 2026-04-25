import { NavLink } from 'react-router-dom';

export default function Navbar({ swaggerUrl }) {
  return (
    <header className="nav" role="banner">
      <div className="nav-inner">
        {/* Brand */}
        <NavLink to="/" className="nav-brand" aria-label="RAPHA MEDICAL AI — Home">
          <img className="nav-logo" aria-hidden="true" src="/logo.png" alt="Logo" />
          <span>RAPHA MEDICAL AI</span>
        </NavLink>

        {/* Links */}
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Try it
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            API Docs
          </NavLink>
          {swaggerUrl && (
            <a
              className="nav-link"
              href={swaggerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Swagger
            </a>
          )}
        </nav>

        {/* Right */}
        <div className="nav-actions">
          <span className="nav-badge">Beta</span>
        </div>
      </div>
    </header>
  );
}
