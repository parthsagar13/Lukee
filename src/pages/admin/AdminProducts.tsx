import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Check, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../../types.js';
import { useAdmin } from '../../contexts/AdminContext.js';

const MATERIALS_PRESETS = [
  { name: '18k Yellow Gold', purity: '18K (750)' },
  { name: '14k White Gold', purity: '14K (585)' },
  { name: '950 Platinum', purity: '950 (95%)' },
  { name: '18k Rose Gold', purity: '18K (750)' },
  { name: '925 Sterling Silver', purity: '925 (92.5%)' }
];

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAdmin();
  const [searchParams] = useSearchParams();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formMaterialIdx, setFormMaterialIdx] = useState('0');
  const [formCustomMaterial, setFormCustomMaterial] = useState('');
  const [formCustomPurity, setFormCustomPurity] = useState('');
  const [formWeight, setFormWeight] = useState('0');
  const [formStock, setFormStock] = useState('5');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formBestSeller, setFormBestSeller] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formImages, setFormImages] = useState<string[]>(['']);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  
  const [error, setError] = useState('');

  const fetchCategoriesAndProducts = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      setCategories(catData || []);

      // 2. Fetch products (status=all to manage archived ones too)
      const prodRes = await fetch('/api/products?status=all');
      const prodData = await prodRes.json();
      setProducts(prodData.products || []);
    } catch (err) {
      console.error('Error fetching inventory tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProducts().then(() => {
      // Handle "replenish" edit deep links from dashboard alerts
      const editId = searchParams.get('edit');
      if (editId) {
        const prod = products.find(p => p._id === editId);
        if (prod) {
          handleOpenEdit(prod);
        }
      }
    });
  }, [searchParams]);

  // Re-run lookup if products loaded later
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && products.length > 0) {
      const prod = products.find(p => p._id === editId);
      if (prod) {
        handleOpenEdit(prod);
      }
    }
  }, [products]);

  const handleOpenCreate = () => {
    setError('');
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormShortDesc('');
    setFormCategory(categories[0]?._id || '');
    setFormSku(`LK-JW-${Math.floor(10000 + Math.random() * 90000)}`);
    setFormPrice('');
    setFormSalePrice('');
    setFormMaterialIdx('0');
    setFormCustomMaterial('');
    setFormCustomPurity('');
    setFormWeight('0');
    setFormStock('5');
    setFormFeatured(false);
    setFormBestSeller(false);
    setFormNewArrival(true);
    setFormStatus('active');
    setFormImages(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80', '', '']);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setError('');
    setEditingId(prod._id);
    setFormName(prod.name);
    setFormDesc(prod.description);
    setFormShortDesc(prod.shortDescription || '');
    setFormCategory(prod.category);
    setFormSku(prod.sku);
    setFormPrice(String(prod.price));
    setFormSalePrice(prod.salePrice !== undefined && prod.salePrice !== null ? String(prod.salePrice) : '');
    
    // Check if preset material
    const presetIdx = MATERIALS_PRESETS.findIndex(m => m.name === prod.material && m.purity === prod.purity);
    if (presetIdx !== -1) {
      setFormMaterialIdx(String(presetIdx));
    } else {
      setFormMaterialIdx('custom');
      setFormCustomMaterial(prod.material);
      setFormCustomPurity(prod.purity);
    }

    setFormWeight(String(prod.weight));
    setFormStock(String(prod.stock));
    setFormFeatured(prod.featured || false);
    setFormBestSeller(prod.bestSeller || false);
    setFormNewArrival(prod.newArrival || false);
    setFormStatus(prod.status || 'active');
    setFormImages(prod.images && prod.images.length > 0 ? [...prod.images] : ['']);
    setFormSeoTitle(prod.seoTitle || '');
    setFormSeoDesc(prod.seoDescription || '');
    setIsFormOpen(true);
  };

  const handleAddImageUrl = () => {
    setFormImages([...formImages, '']);
  };

  const handleRemoveImageUrl = (idx: number) => {
    setFormImages(formImages.filter((_, i) => i !== idx));
  };

  const handleImageUrlChange = (idx: number, val: string) => {
    const updated = [...formImages];
    updated[idx] = val;
    setFormImages(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formName.trim() || !formSku.trim() || !formPrice.trim() || !formCategory) {
      setError('Required fields: Name, SKU reference, Price rate, and Category sector.');
      return;
    }

    // Resolve material info
    let material = '';
    let purity = '';
    if (formMaterialIdx === 'custom') {
      material = formCustomMaterial.trim() || 'Precious Metal';
      purity = formCustomPurity.trim() || 'Unspecified';
    } else {
      const preset = MATERIALS_PRESETS[Number(formMaterialIdx)];
      material = preset.name;
      purity = preset.purity;
    }

    // Clean image URLs array
    const cleanedImages = formImages.filter(img => img.trim() !== '');
    if (cleanedImages.length === 0) {
      cleanedImages.push('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80');
    }

    const payload = {
      name: formName.trim(),
      description: formDesc.trim() || `Spectacular design in ${material} and ${purity}.`,
      shortDescription: formShortDesc.trim() || `Exquisite handcrafted ${formName}.`,
      category: formCategory,
      sku: formSku.trim().toUpperCase(),
      price: Number(formPrice),
      salePrice: formSalePrice.trim() !== '' ? Number(formSalePrice) : null,
      material,
      purity,
      weight: Number(formWeight) || 1.0,
      stock: Number(formStock) || 0,
      featured: formFeatured,
      bestSeller: formBestSeller,
      newArrival: formNewArrival,
      status: formStatus,
      images: cleanedImages,
      seoTitle: formSeoTitle.trim() || `${formName} in Premium ${material} | Lukee Jewels`,
      seoDescription: formSeoDesc.trim() || formShortDesc.trim()
    };

    const url = editingId ? `/api/products/${editingId}` : '/api/products';
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
        fetchCategoriesAndProducts();
      } else {
        setError(data.error || 'Failed to submit product form.');
      }
    } catch (err) {
      console.error('Product form submission failure:', err);
      setError('Connection failure during dispatch.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely certain you want to delete this jewelry piece? This action is irreversible.')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchCategoriesAndProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Filter list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-products-page" className="space-y-8 font-sans">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold-100 pb-5">
        <div>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold-600 block font-light">Inventory Control</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-gray-800">Products Catalog</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 hover:bg-gold-500 hover:text-white transition-all rounded-sm flex items-center gap-2"
        >
          <Plus size={14} />
          <span>New Catalog Item</span>
        </button>
      </div>

      {/* Grid Toolbar Filter controllers */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#fcfbf9] border border-gold-100/50 p-4 rounded-sm">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search name, SKU, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-gold-200 py-2 pl-8 pr-3 rounded-sm focus:outline-none focus:border-gold-500 text-gray-700"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
        </div>

        {/* Category selector */}
        <div className="w-full md:w-56 flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-gold-200 text-xs px-2.5 py-2 focus:outline-none focus:border-gold-500 text-gray-700 rounded-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <span className="text-[0.7rem] text-gray-400 font-mono flex items-center justify-end uppercase flex-shrink-0">
          Mapped: {filteredProducts.length} elements
        </span>
      </div>

      {/* Catalog Grid/Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-xs">Exhuming cases...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-xs border border-dashed border-gold-200 rounded-sm">
          No matching jewelry products found. Define a new item index.
        </div>
      ) : (
        <div className="bg-white border border-gold-100 rounded-sm shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs font-light text-gray-600">
            <thead className="bg-[#fcfbf9] border-b border-gold-100/50 text-[0.65rem] uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3 px-4 font-medium">Design Preview</th>
                <th className="py-3 px-4 font-medium">SKU Index</th>
                <th className="py-3 px-4 font-medium">Precious Metal</th>
                <th className="py-3 px-4 font-medium">Store Prices</th>
                <th className="py-3 px-4 font-medium">Stock Status</th>
                <th className="py-3 px-4 font-medium">Collection Flags</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => {
                const isLow = p.stock < 5;
                const isOnSale = p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price;
                const catRef = categories.find(c => c._id === p.category)?.name || 'General';

                return (
                  <tr key={p._id} className="hover:bg-gold-50/10 transition-colors">
                    {/* Preview */}
                    <td className="py-3 px-4 flex items-center space-x-3 min-w-[200px]">
                      <div className="w-12 h-12 bg-[#faf9f6] border border-gray-100 flex-shrink-0 rounded-sm overflow-hidden flex items-center justify-center">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <span className="font-serif text-gray-800 text-xs sm:text-sm font-semibold line-clamp-1 block">{p.name}</span>
                        <span className="text-[0.65rem] text-gold-600 uppercase font-light block">{catRef}</span>
                      </div>
                    </td>
                    
                    {/* SKU */}
                    <td className="py-3 px-4 font-mono font-medium text-gray-500">{p.sku}</td>
                    
                    {/* Metal */}
                    <td className="py-3 px-4">
                      <span className="block text-gray-700 font-medium">{p.material}</span>
                      <span className="text-[0.65rem] text-gray-400 font-mono block">{p.purity} &bull; {p.weight}g</span>
                    </td>
                    
                    {/* Pricing */}
                    <td className="py-3 px-4">
                      {isOnSale ? (
                        <div className="space-y-0.5">
                          <span className="block font-mono text-gold-600 font-bold">${p.salePrice?.toLocaleString()}</span>
                          <span className="block font-mono text-gray-400 line-through text-[0.65rem]">${p.price.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-gray-800 font-medium">${p.price.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[0.65rem] ${
                        p.stock === 0
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : isLow
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4 space-y-0.5">
                      {p.featured && <span className="inline-block bg-gold-500 text-white text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm mr-1">Featured</span>}
                      {p.bestSeller && <span className="inline-block bg-[#1c1a17] text-gold-200 text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm mr-1">Bestseller</span>}
                      {p.newArrival && <span className="inline-block bg-gold-50 border border-gold-200 text-gold-800 text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">New</span>}
                      {p.status === 'inactive' && <span className="inline-block bg-red-50 border border-red-100 text-red-700 text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm block w-fit mt-1">Archived</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 min-w-[100px]">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 border border-gold-200 text-gray-500 hover:text-gold-600 rounded-sm hover:bg-gold-50/20"
                        title="Edit Jewelry Product"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 border border-gold-200 text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50/20"
                        title="Delete Product"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create overlay panel */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#11100e]/40 backdrop-blur-xs"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="relative w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gold-100 flex justify-between items-center bg-[#fcfbf9]">
              <h3 className="font-serif text-lg text-gray-800 font-medium">
                {editingId ? 'Modify Jewelry Specifications' : 'Commission New Jewelry Index'}
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

              {/* Title & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Jewelry Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Elysian Diamond Solitaire"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SKU reference identifier</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. LK-RIN-10291"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-mono"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Short Pitch / Headline description</label>
                <input
                  type="text"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="Exquisitely crafted engagement ring in brilliant 18k gold..."
                  className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-light"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Full Design Narrative & Specifications</label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Tell the artisan narrative, detailed stone specifications, diamond carats, and polish notes..."
                  className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 resize-none"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Category Sector</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Materials Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Precious Alloy Alloy / Preset</label>
                  <select
                    value={formMaterialIdx}
                    onChange={(e) => setFormMaterialIdx(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                  >
                    {MATERIALS_PRESETS.map((m, idx) => (
                      <option key={idx} value={idx}>{m.name} ({m.purity})</option>
                    ))}
                    <option value="custom">Define custom precious alloy...</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Total Metal Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-mono"
                  />
                </div>
              </div>

              {/* Custom metal inputs if selected */}
              {formMaterialIdx === 'custom' && (
                <div className="grid grid-cols-2 gap-4 bg-gold-50/20 border border-gold-100 p-4 rounded-sm">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gold-700 block font-medium">Custom Alloy name</label>
                    <input
                      type="text"
                      value={formCustomMaterial}
                      onChange={(e) => setFormCustomMaterial(e.target.value)}
                      placeholder="e.g. Brushed Black Titanium"
                      className="w-full text-xs bg-white border border-gold-200 py-2.5 px-3 focus:outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gold-700 block font-medium">Custom Alloy Purity index</label>
                    <input
                      type="text"
                      value={formCustomPurity}
                      onChange={(e) => setFormCustomPurity(e.target.value)}
                      placeholder="e.g. Titanium Grade 5"
                      className="w-full text-xs bg-white border border-gold-200 py-2.5 px-3 focus:outline-none rounded-sm"
                    />
                  </div>
                </div>
              )}

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Retail Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 2400"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Promotional Sale Price ($)</label>
                  <input
                    type="number"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    placeholder="e.g. 1950 (optional)"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 font-mono"
                  />
                </div>
              </div>

              {/* Multiple Image URL Lists (Strictly entered via text input as mandated) */}
              <div className="space-y-3.5 border-t border-gold-100 pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-sm text-gold-700 font-medium">Pre-loaded Image URL Registry</h4>
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="text-[0.65rem] font-bold tracking-widest uppercase text-[#be903c] border-b border-gold-300 hover:text-[#aa7a30]"
                  >
                    + Append URL Row
                  </button>
                </div>
                
                <p className="text-[0.65rem] text-gray-400 leading-relaxed font-light">
                  Provide high-resolution image URLs (Unsplash/Pexels or salon public folders). Ensure at least 3 URLs for optimal slide viewing.
                </p>

                <div className="space-y-2">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={imgUrl}
                        onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        className="flex-1 text-xs bg-gray-50 border border-gold-200 py-2 px-3 rounded-sm text-gray-600 font-light"
                      />
                      {formImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges Toggle Row */}
              <div className="border-t border-gold-100 pt-4 space-y-3">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Display Badges</label>
                <div className="flex flex-wrap gap-4 text-xs font-light">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="rounded text-gold-500 focus:ring-gold-500 border-gold-300"
                    />
                    <span>Featured Flag</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formBestSeller}
                      onChange={(e) => setFormBestSeller(e.target.checked)}
                      className="rounded text-gold-500 focus:ring-gold-500 border-gold-300"
                    />
                    <span>Best Seller Flag</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formNewArrival}
                      onChange={(e) => setFormNewArrival(e.target.checked)}
                      className="rounded text-gold-500 focus:ring-gold-500 border-gold-300"
                    />
                    <span>New Arrival Flag</span>
                  </label>
                </div>
              </div>

              {/* Status & SEO metadata */}
              <div className="grid grid-cols-2 gap-4 border-t border-gold-100 pt-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Catalog Listing Availability</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="inactive">Archived (Vaulted)</option>
                  </select>
                </div>
                
                <div className="space-y-2 col-span-2 pt-2">
                  <h4 className="font-serif text-sm text-gold-700 font-medium">SEO Identifiers</h4>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SEO Title Header</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="Elysian Diamond Solitaire Ring in 18k White Gold | Lukee Jewels"
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={formSeoDesc}
                    onChange={(e) => setFormSeoDesc(e.target.value)}
                    placeholder="Bespoke engagement diamond ring in pristine condition. Kimberley Process certified..."
                    className="w-full text-xs bg-gray-50 border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-gray-700 resize-none font-light"
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
                  Confirm Specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
