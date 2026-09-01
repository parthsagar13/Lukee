import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.js';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.admin);
        navigate('/admin');
      } else {
        setError(data.error || 'Invalid administrative credentials.');
      }
    } catch (err) {
      console.error('Login request failure:', err);
      setError('Connection failed. Verify server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-page"
      className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-dark font-sans overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-2/25 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white border border-line rounded-xl shadow-deep p-8 sm:p-10">
        <div className="text-center space-y-4 mb-8">
          <Link to="/" aria-label="Lukee Jewels Home" className="inline-block">
            <img
              src="/lukee-logo.png"
              alt="Lukee Jewels"
              className="h-14 sm:h-16 w-auto object-contain mx-auto"
            />
          </Link>
          <div className="space-y-2">
            <p className="text-[0.65rem] tracking-[0.35em] uppercase text-brand font-bold">
              Atelier Control Panel
            </p>
            <h1 className="font-serif text-2xl sm:text-[1.65rem] text-ink font-semibold tracking-wide">
              Secure Administrative Login
            </h1>
            <div className="w-10 h-px bg-brand mx-auto" />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 flex items-center gap-2 rounded-lg">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="admin-email"
              className="text-[0.65rem] tracking-wider uppercase text-muted block font-semibold"
            >
              Administrator Email
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lukeejewels.com"
                className="w-full text-sm bg-surface border border-line py-3 pl-9 pr-3 focus:outline-none focus:border-brand rounded-lg text-ink"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="admin-password"
              className="text-[0.65rem] tracking-wider uppercase text-muted block font-semibold"
            >
              Control Key / Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-surface border border-line py-3 pl-9 pr-3 focus:outline-none focus:border-brand rounded-lg text-ink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white text-xs uppercase tracking-widest font-bold py-3.5 hover:bg-brand-dark transition-colors duration-300 rounded-lg disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? 'Authenticating credentials…' : 'Access Control Panel'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-line text-center text-[0.65rem] text-muted flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-brand flex-shrink-0" />
          <span>FIPS cryptographically secure JWT authentication</span>
        </div>
      </div>
    </div>
  );
};
