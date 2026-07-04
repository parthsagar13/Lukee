import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Shield, LayoutGrid, Package, AlertTriangle, Star, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { DashboardStats, Product } from '../../types.js';
import { useAdmin } from '../../contexts/AdminContext.js';

const COLORS = ['#be903c', '#aa7a30', '#dec383', '#734e22', '#5f401f', '#cfcbc4'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbEngine, setDbEngine] = useState('');
  const { token } = useAdmin();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch low stock products (stock < 5)
      const prodRes = await fetch('/api/products?status=all');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const lowStock = (prodData.products || [])
          .filter((p: Product) => p.stock < 5)
          .sort((a: Product, b: Product) => a.stock - b.stock)
          .slice(0, 5);
        setLowStockProducts(lowStock);
      }

      // Check DB engine
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        // Simple trick to identify engine in dashboard
        const isMongooseId = lowStockProducts[0]?._id?.length === 24 || false;
        setDbEngine(isMongooseId ? 'MongoDB Atlas (Mongoose)' : 'Local File Persistence (JSON)');
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-xs tracking-widest uppercase font-sans">Compiling Analytics Vault...</div>;
  }

  return (
    <div id="admin-dashboard" className="space-y-8 font-sans">
      
      {/* Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1c1a17] text-white p-6 sm:p-8 rounded-sm luxury-shadow gap-4">
        <div>
          <span className="text-[0.65rem] tracking-[0.4em] uppercase text-gold-400 block font-light">Management Console</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">Lukee Jewels Control Center</h1>
          <p className="text-[0.7rem] text-gray-400 font-light mt-1">
            Running database engine: <span className="text-gold-200 font-medium">{stats?.lowStockCount !== undefined ? (dbEngine || 'Persistent JSON Database') : 'Loading...'}</span>
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 border border-gold-400/20 text-xs px-4 py-2 hover:bg-gold-500 hover:text-white transition-all text-gold-200 uppercase tracking-widest rounded-sm"
        >
          <RefreshCw size={12} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white border border-gold-100 p-6 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[0.65rem] tracking-wider uppercase text-gray-400 font-medium block">Total Products</span>
            <span className="text-3xl font-serif text-gray-800 block">{stats?.totalProducts || 0}</span>
          </div>
          <div className="p-3 bg-gold-50 border border-gold-100 text-gold-500 rounded-sm">
            <Package size={20} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gold-100 p-6 rounded-sm flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[0.65rem] tracking-wider uppercase text-gray-400 font-medium block">Active Categories</span>
            <span className="text-3xl font-serif text-gray-800 block">{stats?.totalCategories || 0}</span>
          </div>
          <div className="p-3 bg-gold-50 border border-gold-100 text-gold-500 rounded-sm">
            <LayoutGrid size={20} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gold-100 p-6 rounded-sm flex items-center justify-between shadow-xs border-l-4 border-l-gold-500">
          <div className="space-y-1">
            <span className="text-[0.65rem] tracking-wider uppercase text-gray-400 font-medium block">Featured Designs</span>
            <span className="text-3xl font-serif text-gold-600 block">{stats?.featuredCount || 0}</span>
          </div>
          <div className="p-3 bg-gold-50 border border-gold-100 text-gold-500 rounded-sm">
            <Star size={20} className="fill-gold-400 text-gold-400" />
          </div>
        </div>

        {/* Card 4 */}
        <div className={`bg-white border border-gold-100 p-6 rounded-sm flex items-center justify-between shadow-xs border-l-4 ${stats?.lowStockCount && stats.lowStockCount > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
          <div className="space-y-1">
            <span className="text-[0.65rem] tracking-wider uppercase text-gray-400 font-medium block">Low Stock Alerts</span>
            <span className={`text-3xl font-serif block ${stats?.lowStockCount && stats.lowStockCount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600'}`}>
              {stats?.lowStockCount || 0}
            </span>
          </div>
          <div className={`p-3 rounded-sm ${stats?.lowStockCount && stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
            <AlertTriangle size={20} />
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category distribution (Bar Chart - 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gold-100 p-6 rounded-sm shadow-xs">
          <h3 className="font-serif text-lg text-gray-800 font-medium mb-6 border-b border-gray-100 pb-3 uppercase tracking-wider text-xs">
            Product Density per Category
          </h3>
          <div className="h-80 w-full text-xs font-light text-gray-500 font-mono">
            {stats && stats.categoryStats && stats.categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryStats.slice(0, 7)}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#fbf9f1' }} />
                  <Bar dataKey="count" fill="#be903c" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">No categories mapped to render.</div>
            )}
          </div>
        </div>

        {/* Precious Metals Division (Pie Chart - 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gold-100 p-6 rounded-sm shadow-xs">
          <h3 className="font-serif text-lg text-gray-800 font-medium mb-6 border-b border-gray-100 pb-3 uppercase tracking-wider text-xs">
            Precious Metals Division
          </h3>
          <div className="h-80 w-full text-xs font-light text-gray-500 font-mono flex flex-col justify-center">
            {stats && stats.materialStats && stats.materialStats.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.materialStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {stats.materialStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">No metals recorded in products.</div>
            )}
          </div>
        </div>

      </div>

      {/* Low Stock Alert Board */}
      <div className="bg-white border border-gold-100 p-6 rounded-sm shadow-xs">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h3 className="font-serif text-lg text-gray-800 font-medium uppercase tracking-wider text-xs flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Boutique Vault Stock Alerts
          </h3>
          <Link
            to="/admin/products"
            className="text-[0.65rem] uppercase tracking-widest text-gold-600 hover:text-gold-800 font-semibold flex items-center gap-1"
          >
            Manage Products <ExternalLink size={10} />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-center py-6 text-xs text-gray-400 font-light italic">All vaults are fully stocked.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light text-gray-600">
              <thead className="bg-[#fcfbf9] border-b border-gold-100/50 text-[0.65rem] uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3 px-4 font-medium">Product Name</th>
                  <th className="py-3 px-4 font-medium">SKU Reference</th>
                  <th className="py-3 px-4 font-medium">Precious Alloy</th>
                  <th className="py-3 px-4 font-medium">Current Stock</th>
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-gold-50/20 transition-colors">
                    <td className="py-3 px-4 font-serif text-gray-800 text-sm font-medium">{p.name}</td>
                    <td className="py-3 px-4 font-mono">{p.sku}</td>
                    <td className="py-3 px-4">{p.material} &bull; {p.purity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[0.65rem] ${p.stock === 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">${(p.salePrice ?? p.price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/products?edit=${p._id}`}
                        className="text-xs text-gold-600 hover:text-gold-800 border-b border-gold-300 font-medium"
                      >
                        Replenish
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
