import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Eye } from 'lucide-react';
import { Category } from '../../types.js';
import { useAdmin } from '../../contexts/AdminContext.js';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAdmin();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setError('');
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormOrder('0');
    setFormStatus('active');
    setFormSeoTitle('');
    setFormSeoDesc('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setError('');
    setEditingId(cat._id);
    setFormName(cat.name);
    setFormDesc(cat.description || '');
    setFormOrder(String(cat.displayOrder || 0));
    setFormStatus(cat.status || 'active');
    setFormSeoTitle(cat.seoTitle || '');
    setFormSeoDesc(cat.seoDescription || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formName.trim()) {
      setError('Category name is required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      displayOrder: Number(formOrder),
      status: formStatus,
      seoTitle: formSeoTitle.trim(),
      seoDescription: formSeoDesc.trim()
    };

    const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsFormOpen(false);
        fetchCategories();
      } else {
        setError(data.error || 'Failed to submit category form.');
      }
    } catch (err) {
      console.error('Category form error:', err);
      setError('Connection failure during dispatch.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely certain you want to retire this category? This will sever references from existing products.')) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category.');
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  const toggleStatus = async (cat: Category) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/categories/${cat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-categories-page" className="space-y-8 font-sans">
      
      {/* Title & Add Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold-100 pb-5">
        <div>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold-600 block font-light">Structure Management</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-gray-800">Categories Management</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 hover:bg-gold-500 hover:text-white transition-all rounded-sm flex items-center gap-2"
        >
          <Plus size={14} />
          <span>New Category</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#fcfbf9] border border-gold-100/50 p-4 rounded-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search category, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-gold-200 py-2 pl-8 pr-3 rounded-sm focus:outline-none focus:border-gold-500 text-gray-700"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
        </div>
        <span className="text-[0.7rem] text-gray-400 font-mono uppercase">
          Total: {filteredCategories.length} categories indices
        </span>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-xs">Opening cabinets...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs border border-dashed border-gold-200 rounded-sm">
          No categories found. Create a new category index above.
        </div>
      ) : (
        <div className="bg-white border border-gold-100 rounded-sm shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs font-light text-gray-600">
            <thead className="bg-[#fcfbf9] border-b border-gold-100/50 text-[0.65rem] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3 px-4 font-medium">Display Name</th>
                <th className="py-3 px-4 font-medium">Slug Reference</th>
                <th className="py-3 px-4 font-medium">Order Rank</th>
                <th className="py-3 px-4 font-medium">Status Flag</th>
                <th className="py-3 px-4 font-medium">SEO Indicators</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-gold-50/10 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-serif text-gray-800 text-sm font-semibold block">{cat.name}</span>
                    <span className="text-[0.65rem] text-gray-400 font-light truncate max-w-sm block">{cat.description || 'No description provided.'}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-500 text-[0.7rem]">{cat.slug}</td>
                  <td className="py-4 px-4 font-mono text-[#be903c] font-bold">{cat.displayOrder}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleStatus(cat)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider font-semibold rounded-full border transition-all ${
                        cat.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <Check size={10} className={cat.status === 'active' ? 'opacity-100' : 'opacity-0'} />
                      <span>{cat.status}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 space-y-0.5">
                    <span className="text-[0.65rem] text-gray-500 font-light block">Title: {cat.seoTitle ? '✔' : '❌'}</span>
                    <span className="text-[0.65rem] text-gray-500 font-light block">Desc: {cat.seoDescription ? '✔' : '❌'}</span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 border border-gold-200 text-gray-500 hover:text-gold-600 rounded-sm hover:bg-gold-50/20"
                      title="Edit Category"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 border border-gold-200 text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50/20"
                      title="Delete Category"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Drawer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#11100e]/40 backdrop-blur-xs"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="relative w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-100 flex justify-between items-center bg-[#fcfbf9]">
              <h3 className="font-serif text-lg text-gray-800 font-medium">
                {editingId ? 'Modify Category Settings' : 'Initialize New Category'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Category Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Engagement Rings"
                  className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                />
                {formName && (
                  <span className="text-[0.6rem] font-mono text-gray-400 block">
                    Pre-calculated slug: <span className="text-gold-600">
                      {formName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')}
                    </span>
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Atelier Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detail the metals, gems, and style signatures featured in this range..."
                  className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 resize-none"
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Display order weight</label>
                  <input
                    type="number"
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Availability Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                  >
                    <option value="active">Active (Visible in Shop)</option>
                    <option value="inactive">Inactive (Vaulted)</option>
                  </select>
                </div>
              </div>

              {/* SEO Subheading Divider */}
              <div className="border-t border-gold-100 pt-4 space-y-4">
                <h4 className="font-serif text-sm text-gold-700 font-medium">Search Engine Optimization (SEO)</h4>
                
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SEO Title Header</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="e.g. Buy Luxury Engagement Rings Online | Lukee Jewels"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={formSeoDesc}
                    onChange={(e) => setFormSeoDesc(e.target.value)}
                    placeholder="Provide a search snippet summarizing the collection..."
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 resize-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gold-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/2 border border-gold-300 text-gold-800 text-xs uppercase tracking-widest py-3 hover:bg-gold-50 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest py-3 hover:bg-gold-500 hover:text-white transition-all rounded-sm font-semibold"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
