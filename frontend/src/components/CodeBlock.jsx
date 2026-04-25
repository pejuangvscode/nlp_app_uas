import { useState } from 'react';

export default function CodeBlock({ code, lang = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="code-wrapper">
      <pre className="code-block">
        <code>{code}</code>
      </pre>
      <button
        className={`copy-btn${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}
