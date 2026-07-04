import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminProvider, useAdmin } from './contexts/AdminContext.js';
import { CartProvider } from './contexts/CartContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';

// Public User-Facing Pages
import { Home } from './pages/Home.js';
import { Shop } from './pages/Shop.js';
import { ProductDetails } from './pages/ProductDetails.js';
import { Collections } from './pages/Collections.js';
import { About } from './pages/About.js';
import { Contact } from './pages/Contact.js';
import { PrivacyPolicy } from './pages/PrivacyPolicy.js';
import { Terms } from './pages/Terms.js';
import { NotFound } from './pages/NotFound.js';

// Admin / Back-office Pages
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminCategories } from './pages/admin/AdminCategories.js';
import { AdminProducts } from './pages/admin/AdminProducts.js';
import { AdminSettings } from './pages/admin/AdminSettings.js';
import { AdminLayout } from './layouts/AdminLayout.js';

// 1. Client Layout (Public Storefront wrapper with header, footer and sliding drawers)
const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <CartDrawer />
    </div>
  );
};

// 2. Protected Route Guard (Verifies JWT validation before rendering administrative panes)
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs tracking-widest text-gray-400 uppercase font-sans">Verifying Key Clearance...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            
            {/* Storefront Layout (Client Views) */}
            <Route element={<ClientLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:idOrSlug" element={<ProductDetails />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/404" element={<NotFound />} />
            </Route>

            {/* Standalone Admin Login (No client headers or admin sidebar menus) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Locked Administrative Workspace Panel (Protected routes) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Wildcard Fallback redirects directly to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AdminProvider>
  );
}
