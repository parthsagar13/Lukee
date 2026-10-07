import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { HeroBanner } from '../../types.js';
import { useAdmin } from '../../contexts/AdminContext.js';
import { HERO_BANNER_HEIGHT, HERO_BANNER_MAX_BYTES, HERO_BANNER_SIZE_LABEL, HERO_BANNER_WIDTH, bannerSizeError } from '../../bannerSpec.js';
import { prepareImageDataUrl } from '../../utils/imageUpload.js';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formAlt, setFormAlt] = useState('');
  const [formLink, setFormLink] = useState('/shop');
  const [formOrder, setFormOrder] = useState('1');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formImage, setFormImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setError('');
    setEditingId(null);
    setFormTitle('');
    setFormAlt('');
    setFormLink('/shop');
    setFormOrder(String(banners.length + 1));
    setFormStatus('active');
    setFormImage('');
    setUploading(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (banner: HeroBanner) => {
    setError('');
    setEditingId(banner._id);
    setFormTitle(banner.title);
    setFormAlt(banner.alt || '');
    setFormLink(banner.link || '/shop');
    setFormOrder(String(banner.displayOrder ?? 0));
    setFormStatus(banner.status || 'active');
    setFormImage(banner.image || '');
    setIsFormOpen(true);
  };

  const handleImagePick = async (file?: File) => {
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > HERO_BANNER_MAX_BYTES) {
      setError('Image must be 8MB or smaller.');
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const sizeError = bannerSizeError(bitmap.width, bitmap.height);
      bitmap.close();
      if (sizeError) {
        setError(sizeError);
        return;
      }
    } catch {
      setError('Could not read this image. Use a JPG, PNG, WEBP, or GIF file.');
      return;
    }

    setUploading(true);
    try {
      const { dataUrl, filename } = await prepareImageDataUrl(file, {
        preserveDimensions: true,
        quality: 0.85,
        maxDataUrlBytes: 3.5 * 1024 * 1024,
      });
      const res = await fetch('/api/banner-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filename, data: dataUrl }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.url) {
        setError(
          payload.error ||
            (res.status === 413
              ? 'Image is too large for the server. Try a smaller JPG/WEBP.'
              : 'Failed to upload banner image.')
        );
        return;
      }
      setFormImage(payload.url);
    } catch (err) {
      console.error('Banner upload failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failure during image upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formTitle.trim()) {
      setError('Banner title is required.');
      return;
    }
    if (!formImage.trim()) {
      setError(`Upload a ${HERO_BANNER_SIZE_LABEL} banner image.`);
      return;
    }

    const payload = {
      title: formTitle.trim(),
      alt: formAlt.trim() || formTitle.trim(),
      image: formImage.trim(),
      link: formLink.trim() || '/shop',
      displayOrder: Number(formOrder) || 0,
      status: formStatus,
    };

    const url = editingId ? `/api/banners/${editingId}` : '/api/banners';
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
        fetchBanners();
      } else {
        setError(data.error || 'Failed to save banner.');
      }
    } catch (err) {
      console.error('Banner form error:', err);
      setError('Connection failure during dispatch.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this hero banner from the homepage?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchBanners();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete banner.');
      }
    } catch (err) {
      console.error('Delete banner error:', err);
    }
  };

  const toggleStatus = async (banner: HeroBanner) => {
    const nextStatus = banner.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchBanners();
    } catch (err) {
      console.error('Toggle banner status error:', err);
    }
  };

  const filtered = banners.filter((banner) => {
    const q = searchQuery.toLowerCase();
    return (
      banner.title.toLowerCase().includes(q) ||
      (banner.alt || '').toLowerCase().includes(q) ||
      (banner.link || '').toLowerCase().includes(q)
    );
  });

  return (
    <div id="admin-banners-page" className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold-100 pb-5">
        <div>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-brand-dark block font-light">Homepage</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-gray-800">Hero Banners</h1>
          <p className="text-xs text-gray-400 mt-2 font-light">
            Active banners appear in the homepage hero. Images must be exactly {HERO_BANNER_WIDTH} × {HERO_BANNER_HEIGHT} pixels.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 hover:bg-brand hover:text-white transition-all rounded-sm flex items-center gap-2"
        >
          <Plus size={14} />
          <span>New Banner</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#fcfbf9] border border-gold-100/50 p-4 rounded-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search title, link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-line py-2 pl-8 pr-3 rounded-sm focus:outline-none focus:border-brand text-gray-700"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
        </div>
        <span className="text-[0.7rem] text-gray-400 font-mono uppercase">
          Total: {filtered.length} banners
        </span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-xs">Opening banners...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs border border-dashed border-line rounded-sm">
          No banners yet. Add a {HERO_BANNER_SIZE_LABEL} image to show it on the homepage.
        </div>
      ) : (
        <div className="bg-white border border-gold-100 rounded-sm shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs font-light text-gray-600">
            <thead className="bg-[#fcfbf9] border-b border-gold-100/50 text-[0.65rem] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3 px-4 font-medium">Banner</th>
                <th className="py-3 px-4 font-medium">Link</th>
                <th className="py-3 px-4 font-medium">Order</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((banner) => (
                <tr key={banner._id} className="hover:bg-gold-50/10 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-12 bg-black border border-line overflow-hidden flex-shrink-0">
                        {banner.image ? (
                          <img src={banner.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={14} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-serif text-gray-800 text-sm font-semibold block truncate">{banner.title}</span>
                        <span className="text-[0.65rem] text-gray-400 font-light truncate block">{banner.alt}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-500 text-[0.7rem]">{banner.link || '—'}</td>
                  <td className="py-4 px-4 font-mono text-[#be903c] font-bold">{banner.displayOrder}</td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleStatus(banner)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider font-semibold rounded-full border transition-all ${
                        banner.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <Check size={10} className={banner.status === 'active' ? 'opacity-100' : 'opacity-0'} />
                      <span>{banner.status}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-1.5 border border-line text-gray-500 hover:text-brand-dark rounded-sm hover:bg-gold-50/20"
                      title="Edit banner"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-1.5 border border-line text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50/20"
                      title="Delete banner"
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
          <div className="absolute inset-0 bg-[#11100e]/40 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-100 flex justify-between items-center bg-[#fcfbf9]">
              <h3 className="font-serif text-lg text-gray-800 font-medium">
                {editingId ? 'Edit Hero Banner' : 'New Hero Banner'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
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
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Banner image</label>
                <p className="text-[0.65rem] text-gray-400 font-light leading-relaxed">
                  Required size is {HERO_BANNER_SIZE_LABEL} pixels, the same as the current homepage banners, so the image covers the full hero.
                  JPG, PNG, WEBP, or GIF. Maximum 8MB.
                </p>
                <div className="border border-gold-100 rounded-sm p-3 bg-[#fcfbf9] space-y-3">
                  <div className="aspect-[1920/850] bg-black border border-line overflow-hidden flex items-center justify-center">
                    {formImage ? (
                      <img src={formImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-gray-500" />
                    )}
                  </div>
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
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Festive offer"
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Alt text</label>
                <input
                  type="text"
                  value={formAlt}
                  onChange={(e) => setFormAlt(e.target.value)}
                  placeholder="Short description of the banner"
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Link</label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="/shop or https://..."
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Display order</label>
                  <input
                    type="number"
                    required
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                  >
                    <option value="active">Active (on homepage)</option>
                    <option value="inactive">Inactive (hidden)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold px-5 py-3 hover:bg-brand hover:text-white transition-all rounded-sm disabled:opacity-50"
                >
                  {editingId ? 'Save banner' : 'Create banner'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs uppercase tracking-widest text-gray-400 px-4 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
