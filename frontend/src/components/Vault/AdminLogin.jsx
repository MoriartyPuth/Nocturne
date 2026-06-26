import { useState } from 'react';

/**
 * AdminLogin — Cyberpunk-themed admin authentication modal.
 * Simple PIN/key entry gate to protect write operations.
 */
export default function AdminLogin({ onLogin, onClose }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError('');
    const success = await onLogin(key.trim());
    setLoading(false);
    if (!success) {
      setError('ACCESS DENIED — Invalid operator key.');
      setKey('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="console-card w-full max-w-md mx-4 p-0 border-neon-green/30 overflow-hidden">
        {/* Header */}
        <div className="border-b border-nocturne-border px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-amber animate-pulse" />
            <span className="text-xs font-mono text-neon-amber tracking-wider">
              SECURITY CHECKPOINT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-nocturne-muted hover:text-white text-xs font-mono cursor-pointer transition-colors"
          >
            [ESC]
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-lg font-semibold text-white font-mono">
              Operator Authentication
            </h2>
            <p className="text-xs text-nocturne-muted">
              Enter your admin key to access write operations.
            </p>
          </div>

          {/* Key input */}
          <div className="space-y-2">
            <label className="text-xs text-nocturne-muted font-mono block">
              nocturne:~/auth $
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="enter admin key..."
              className="w-full bg-nocturne-darker border border-nocturne-border rounded-sm px-4 py-3
                         text-neon-green font-mono text-sm placeholder:text-nocturne-muted/40
                         focus:outline-none focus:border-neon-green/50 transition-colors"
              autoFocus
              spellCheck={false}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-neon-red font-mono text-center animate-fade-in">
              <span className="text-neon-red">[ERR]</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="w-full py-3 border border-neon-green/40 text-neon-green font-mono text-sm
                       tracking-wider uppercase rounded-sm cursor-pointer
                       hover:bg-neon-green/10 hover:border-neon-green hover:shadow-neon-green
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-300"
          >
            {loading ? '▓▓▓ AUTHENTICATING...' : '→ AUTHENTICATE'}
          </button>
        </form>
      </div>
    </div>
  );
}
