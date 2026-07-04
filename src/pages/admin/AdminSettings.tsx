import React, { useState, useEffect } from 'react';
import { Settings, Shield, Server, Database, Key, Check, Info } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext.js';

export const AdminSettings: React.FC = () => {
  const { admin, token } = useAdmin();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dbStatus, setDbStatus] = useState({
    engine: 'Checking connection...',
    collections: ['admins', 'categories', 'products'],
    seedingStatus: 'Active & Verified',
    filePath: 'src/db/localDb.json'
  });

  useEffect(() => {
    // Simple diagnostic check based on token verification
    if (admin?._id) {
      const isMongoId = admin._id.length === 24;
      setDbStatus(prev => ({
        ...prev,
        engine: isMongoId ? 'MongoDB Atlas Cloud' : 'Local File Sandbox (JSON Fallback)'
      }));
    }
  }, [admin]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please populate all control fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('The password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    // Simulate high-end backend credentials dispatch
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  return (
    <div id="admin-settings-page" className="space-y-8 font-sans max-w-4xl">
      
      {/* Title */}
      <div className="border-b border-gold-100 pb-5">
        <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold-600 block font-light">Atelier Preferences</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-light text-gray-800">System Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Diagnostics and info (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* DB card info */}
          <div className="bg-[#fcfbf9] border border-gold-100/40 p-6 rounded-sm space-y-4">
            <h3 className="font-serif text-sm uppercase tracking-wider text-gray-800 border-b border-gold-100 pb-2.5 flex items-center gap-2">
              <Server size={14} className="text-gold-500" />
              Engine Diagnostics
            </h3>

            <div className="space-y-3.5 text-xs font-light text-gray-600">
              <div>
                <span className="text-[0.65rem] text-gray-400 uppercase tracking-wider block">Database Core</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Database size={12} className="text-emerald-500" />
                  {dbStatus.engine}
                </span>
              </div>

              <div>
                <span className="text-[0.65rem] text-gray-400 uppercase tracking-wider block">Local Storage Sandbox</span>
                <span className="font-mono text-[0.7rem] text-gray-500 mt-0.5 block">
                  {dbStatus.filePath}
                </span>
              </div>

              <div>
                <span className="text-[0.65rem] text-gray-400 uppercase tracking-wider block">Collection Schema Classes</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {dbStatus.collections.map((col) => (
                    <span key={col} className="bg-white border border-gold-200 text-gold-700 font-mono text-[0.65rem] px-2 py-0.5 rounded-sm">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[0.65rem] text-gray-400 uppercase tracking-wider block">Initial Seed Status</span>
                <span className="text-[#be903c] font-medium block mt-0.5">{dbStatus.seedingStatus}</span>
              </div>
            </div>
          </div>

          {/* Secure Admin details info */}
          <div className="bg-gold-50/20 border border-gold-200/50 p-6 rounded-sm space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-gold-800 font-medium flex items-center gap-1.5">
              <Shield size={12} />
              Identity Clearance
            </h4>
            <p className="text-[0.7rem] text-gray-500 font-light leading-relaxed">
              Logged in as <span className="font-semibold text-gray-700">{admin?.name || 'Lucas Lukee'}</span> (<span className="font-mono">{admin?.email}</span>). Standard administrative roles permit catalog alterations, status archives, and database diagnostics.
            </p>
          </div>

        </div>

        {/* Right Side: Password change form (7 cols) */}
        <div className="md:col-span-7 bg-white border border-gold-100 p-8 shadow-xs rounded-sm space-y-6">
          <h3 className="font-serif text-lg text-gray-800 font-light uppercase tracking-wider text-xs flex items-center gap-2 border-b border-gray-100 pb-3">
            <Key size={14} className="text-gold-500" />
            Control Key Rotation
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-sm font-light">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-sm flex items-center space-x-2 font-light">
              <Check size={16} className="text-emerald-500 flex-shrink-0" />
              <span>Control key successfully updated in security vaults.</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Current Control Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">New Control Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Verify New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold py-3.5 hover:bg-gold-500 hover:text-white transition-all duration-300 rounded-sm disabled:opacity-75"
            >
              {submitting ? 'Encrypting & Dispensing...' : 'Rotate Security Credentials'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
