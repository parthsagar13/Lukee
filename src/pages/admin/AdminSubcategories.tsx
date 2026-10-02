import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { SubCategory, Category, SubCategoryGroup } from '../../types.js';
import { SUBCATEGORY_GROUP_OPTIONS, SUBCATEGORY_GROUP_LABELS } from '../../subcategorySpec.js';
import { useAdmin } from '../../contexts/AdminContext.js';

const SUBCATEGORY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const slugifyPreview = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');

export const AdminSubcategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formGroup, setFormGroup] = useState<SubCategoryGroup>('style');
  const [formImage, setFormImage] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const categoryNameById = (id: string) =>
    categories.find((c) => c._id === id)?.name || '—';

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subcategories?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const resetForm = () => {
    setError('');
    setEditingId(null);
    setFormName('');
    setFormCategoryId(categories[0]?._id || '');
    setFormGroup('style');
    setFormImage('');
    setFormLink('');
    setFormOrder('0');
    setFormStatus('active');
    setUploading(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: SubCategory) => {
    setError('');
    setEditingId(item._id);
    setFormName(item.name);
    setFormCategoryId(item.categoryId);
    setFormGroup(item.group || 'style');
    setFormImage(item.image || '');
    setFormLink(item.link || '');
    setFormOrder(String(item.displayOrder ?? 0));
    setFormStatus(item.status || 'active');
    setIsFormOpen(true);
  };

  const handleImagePick = async (file?: File) => {
    if (!file) return;
    setError('');

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Please choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > SUBCATEGORY_IMAGE_MAX_BYTES) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = typeof reader.result === 'string' ? reader.result : '';
        const res = await fetch('/api/subcategory-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ filename: file.name, data }),
        });
        const payload = await res.json();
        if (!res.ok || !payload.url) {
          setError(payload.error || 'Failed to upload subcategory image.');
          return;
        }
        setFormImage(payload.url);
      } catch (err) {
        console.error('Subcategory upload failed:', err);
        setError('Connection failure during image upload.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setUploading(false);
      setError('Could not read the selected image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formName.trim()) {
      setError('Subcategory name is required.');
      return;
    }
    if (!formCategoryId) {
      setError('Parent category is required.');
      return;
    }
    if (!formGroup) {
      setError('A mega-menu group is required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      slug: slugifyPreview(formName.trim()),
      categoryId: formCategoryId,
      group: formGroup,
      image: formImage.trim(),
      link: formLink.trim(),
      displayOrder: Number(formOrder) || 0,
      status: formStatus,
    };

    const url = editingId ? `/api/subcategories/${editingId}` : '/api/subcategories';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFormOpen(false);
        fetchSubcategories();
      } else {
        setError(data.error || 'Failed to save subcategory.');
      }
    } catch (err) {
      console.error('Subcategory form error:', err);
      setError('Connection failure during dispatch.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this subcategory from the mega menu?')) return;
    try {
      const res = await fetch(`/api/subcategories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSubcategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete subcategory.');
      }
    } catch (err) {
      console.error('Delete subcategory error:', err);
    }
  };

  const toggleStatus = async (item: SubCategory) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/subcategories/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchSubcategories();
    } catch (err) {
      console.error('Toggle subcategory status error:', err);
    }
  };

  const filtered = subcategories.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.slug || '').toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-subcategories-page" className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold-100 pb-5">
        <div>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-brand-dark block font-light">
            Structure Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-gray-800">
            Subcategories Management
          </h1>
          <p className="text-xs text-gray-400 mt-2 font-light">
            Mega-menu links under each parent category. Image thumbnails are optional.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 hover:bg-brand hover:text-white transition-all rounded-sm flex items-center gap-2"
        >
          <Plus size={14} />
          <span>New Subcategory</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-[#fcfbf9] border border-gold-100/50 p-4 rounded-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search subcategory name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white border border-line py-2 pl-8 pr-3 rounded-sm focus:outline-none focus:border-brand text-gray-700"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-56 text-xs bg-white border border-line py-2 px-3 rounded-sm focus:outline-none focus:border-brand text-gray-700"
          >
            <option value="">All parent categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[0.7rem] text-gray-400 font-mono uppercase whitespace-nowrap">
          Total: {filtered.length} subcategories
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-xs">Opening subcategories...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs border border-dashed border-line rounded-sm">
          No subcategories found. Create a new mega-menu entry above.
        </div>
      ) : (
        <div className="bg-white border border-gold-100 rounded-sm shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs font-light text-gray-600">
            <thead className="bg-[#fcfbf9] border-b border-gold-100/50 text-[0.65rem] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3 px-4 font-medium">Subcategory</th>
                <th className="py-3 px-4 font-medium">Parent Category</th>
                <th className="py-3 px-4 font-medium">Group</th>
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-gold-50/10 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#fcfbf9] border border-line overflow-hidden flex-shrink-0 rounded-sm">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={14} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif text-gray-800 text-sm font-semibold block truncate">
                          {item.name}
                        </span>
                        <span className="text-[0.65rem] text-gray-400 font-mono truncate block">
                          {item.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{categoryNameById(item.categoryId)}</td>
                  <td className="py-4 px-4 text-gray-500">
                    {SUBCATEGORY_GROUP_LABELS[item.group] || item.group}
                  </td>
                  <td className="py-4 px-4 font-mono text-[#be903c] font-bold">{item.displayOrder}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleStatus(item)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider font-semibold rounded-full border transition-all ${
                        item.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <Check size={10} className={item.status === 'active' ? 'opacity-100' : 'opacity-0'} />
                      <span>{item.status}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 border border-line text-gray-500 hover:text-brand-dark rounded-sm hover:bg-gold-50/20"
                      title="Edit subcategory"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 border border-line text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50/20"
                      title="Delete subcategory"
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div
            className="absolute inset-0 bg-[#11100e]/40 backdrop-blur-xs"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="relative w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-100 flex justify-between items-center bg-[#fcfbf9]">
              <h3 className="font-serif text-lg text-gray-800 font-medium">
                {editingId ? 'Modify Subcategory' : 'Initialize New Subcategory'}
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

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Solitaire Rings"
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                />
                {formName && (
                  <span className="text-[0.6rem] font-mono text-gray-400 block">
                    Pre-calculated slug:{' '}
                    <span className="text-brand-dark">{slugifyPreview(formName)}</span>
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                  Parent Category
                </label>
                <select
                  required
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                >
                  <option value="">Select parent category…</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                  Mega-menu Group
                </label>
                <select
                  required
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value as SubCategoryGroup)}
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                >
                  {SUBCATEGORY_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                  Thumbnail image (optional)
                </label>
                <p className="text-[0.65rem] text-gray-400 font-light leading-relaxed">
                  JPG, PNG, WEBP, or GIF. Maximum 5MB. No fixed pixel size required.
                </p>
                <div className="border border-gold-100 rounded-sm p-3 bg-[#fcfbf9] space-y-3">
                  <div className="w-24 h-24 bg-white border border-line overflow-hidden flex items-center justify-center rounded-sm">
                    {formImage ? (
                      <img src={formImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-1.5 bg-[#1c1a17] text-gold-200 text-[0.65rem] uppercase tracking-widest font-semibold px-3 py-2 rounded-sm cursor-pointer hover:bg-brand hover:text-white transition-colors">
                      <Upload size={12} />
                      {uploading ? 'Uploading…' : 'Choose image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          void handleImagePick(file);
                        }}
                      />
                    </label>
                    {formImage && (
                      <button
                        type="button"
                        onClick={() => setFormImage('')}
                        className="text-[0.65rem] uppercase tracking-widest text-gray-400 hover:text-red-600 px-2 py-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                  Link (optional)
                </label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="/shop?filter=... or https://..."
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                    Display order weight
                  </label>
                  <input
                    type="number"
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">
                    Availability Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                  >
                    <option value="active">Active (Visible in Shop)</option>
                    <option value="inactive">Inactive (Vaulted)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gold-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/2 border border-brand/30 text-brand-dark text-xs uppercase tracking-widest py-3 hover:bg-gold-50 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-1/2 bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest py-3 hover:bg-brand hover:text-white transition-all rounded-sm font-semibold disabled:opacity-50"
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
