import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, ListCollapse, Settings, LogOut, ExternalLink, Menu, X, ShieldAlert } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext.js';

export const AdminLayout: React.FC = () => {
  const { admin, logout } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
    { name: 'Products Catalog', path: '/admin/products', icon: Package },
    { name: 'Categories indices', path: '/admin/categories', icon: ListCollapse },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div id="admin-layout" className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Sticky top navigation */}
      <header className="md:hidden bg-[#1c1a17] text-white py-4 px-6 flex justify-between items-center border-b border-gold-500/20 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="font-serif font-light text-lg tracking-wider text-gold-300">Lukee Jewels</span>
          <span className="text-[0.55rem] tracking-widest bg-gold-500/20 text-gold-200 border border-gold-400/30 px-1.5 py-0.5 rounded-sm font-bold uppercase">Atelier</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gold-200 hover:text-white p-1"
          title="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 1. Left Sidebar Navigation (Desktop & Mobile drawer) */}
      <aside
        className={`bg-[#1c1a17] text-white w-64 flex-shrink-0 flex flex-col justify-between border-r border-gold-500/10 z-40 transition-transform duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:sticky inset-y-0 left-0 pt-16 md:pt-0 h-screen`}
      >
        <div className="space-y-8 p-6">
          {/* Logo */}
          <div className="hidden md:block border-b border-gold-500/10 pb-6">
            <span className="text-[0.65rem] tracking-[0.4em] uppercase text-gold-500 block font-light">Management Shell</span>
            <Link to="/admin" className="font-serif text-2xl font-light tracking-widest text-white mt-1 block">
              Lukee Jewels
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-sm text-xs uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-gold-500 text-white font-bold shadow-md shadow-gold-900/20'
                      : 'text-gray-400 hover:bg-gold-500/10 hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-gold-500/70'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile details and logout */}
        <div className="p-6 border-t border-gold-500/10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gold-500/20 border border-gold-400/30 text-gold-300 font-serif rounded-full flex items-center justify-center font-bold text-xs">
              {admin?.name?.charAt(0) || 'L'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white block truncate">{admin?.name || 'Lucas Lukee'}</span>
              <span className="text-[0.6rem] text-gold-400 font-mono block truncate">{admin?.email || 'admin@lukeejewels.com'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {/* External shop redirect */}
            <Link
              to="/"
              className="border border-gold-500/20 hover:border-gold-500 hover:text-gold-200 text-[0.65rem] py-2 px-1 text-center text-gray-400 uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-1"
            >
              <span>Store</span>
              <ExternalLink size={10} />
            </Link>

            {/* Logout Trigger */}
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-600 hover:text-white text-[0.65rem] py-2 px-1 text-center text-red-400 uppercase tracking-widest transition-colors rounded-sm flex items-center justify-center gap-1 cursor-pointer font-semibold"
            >
              <span>Logout</span>
              <LogOut size={10} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Page content panel */}
      <div id="admin-main-stage" className="flex-grow flex flex-col min-w-0">
        
        {/* Desktop Top-bar with current date metrics */}
        <header className="hidden md:flex bg-white border-b border-gold-100/50 h-16 items-center justify-between px-8 select-none">
          <div className="flex items-center space-x-2 text-[0.65rem] tracking-widest uppercase font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-sm">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
            <span>Atelier Core Security Verification Active</span>
          </div>

          <span className="text-[0.7rem] text-gray-400 font-light tracking-wide">
            Workspace: <span className="font-semibold text-gray-700">Lukee Jewels Fifth Ave Boutique</span>
          </span>
        </header>

        {/* Content Outlet Box */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
