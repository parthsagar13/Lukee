import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.js';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
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
    <div id="admin-login-page" className="min-h-[70vh] flex items-center justify-center px-4 bg-[#F9F6F2]">
      <div className="w-full max-w-md bg-[#FDFCFB] border border-gold-200 p-8 sm:p-10 shadow-xl rounded-sm space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#F9F6F2] border border-gold-200 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock size={20} />
          </div>
          <span className="text-[0.65rem] tracking-[0.4em] uppercase text-gold-500 block font-semibold">Atelier Control Panel</span>
          <h1 className="font-serif text-2xl text-[#1A1A1A] tracking-wide font-medium">Secure Administrative Login</h1>
          <div className="w-8 h-[1px] bg-gold-400 mx-auto mt-2"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 flex items-center space-x-2 rounded-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-semibold">Administrator Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lukeejewels.com"
                className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 pl-9 pr-3 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A] font-mono"
              />
              <Mail size={14} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-semibold">Control Key / Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 pl-9 pr-3 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A]"
              />
              <Lock size={14} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-bold py-3.5 hover:bg-gold-500 hover:text-white transition-all duration-300 rounded-sm disabled:opacity-70 flex items-center justify-center space-x-2"
          >
            {loading ? <span>Authenticating credentials...</span> : <span>Access Control Panel</span>}
          </button>
        </form>

        <div className="border-t border-gold-200 pt-4 text-center text-[0.65rem] text-gray-400 font-light flex items-center justify-center space-x-1.5">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>FIPS cryptographically secure JWT authentication</span>
        </div>

      </div>
    </div>
  );
};
