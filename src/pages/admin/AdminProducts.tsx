import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon, Upload, Link2, Film } from 'lucide-react';
import { Product, Category, DiamondGroup } from '../../types.js';
import { useAdmin } from '../../contexts/AdminContext.js';
import { emptyDiamondGroup, metalNameFromMaterial, metalPurityLabel } from '../../db/productSpecs.js';
import { prepareImageDataUrl } from '../../utils/imageUpload.js';

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
  const [formMainImage, setFormMainImage] = useState('');
  const [formVideos, setFormVideos] = useState<string[]>([]);
  const [showImageUrl, setShowImageUrl] = useState<boolean[]>([false]);
  const [showVideoUrl, setShowVideoUrl] = useState<boolean[]>([]);
  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);
  const [uploadingVideoIdx, setUploadingVideoIdx] = useState<number | null>(null);
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [libraryVideos, setLibraryVideos] = useState<string[]>([]);
  const [pasteUrl, setPasteUrl] = useState('');
  const [showPasteUrl, setShowPasteUrl] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formDiamondTotalCount, setFormDiamondTotalCount] = useState('');
  const [formDiamondTotalWeight, setFormDiamondTotalWeight] = useState('');
  const [formSettingType, setFormSettingType] = useState('');
  const [formDiamondGroups, setFormDiamondGroups] = useState<DiamondGroup[]>([
    emptyDiamondGroup(),
    emptyDiamondGroup(),
  ]);
  const [formGemstoneTotalCount, setFormGemstoneTotalCount] = useState('');
  const [formGemstoneTotalWeight, setFormGemstoneTotalWeight] = useState('');
  const [formGemstoneType, setFormGemstoneType] = useState('');
  const [formGemstoneColor, setFormGemstoneColor] = useState('');
  const [formGemstoneStoneCount, setFormGemstoneStoneCount] = useState('');
  const [formGemstoneSettingType, setFormGemstoneSettingType] = useState('');
  const [formGemstoneShape, setFormGemstoneShape] = useState('');
  const [formGemstoneWeightApprox, setFormGemstoneWeightApprox] = useState('');
  
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
    setFormImages([]);
    setFormMainImage('');
    setFormVideos([]);
    setPasteUrl('');
    setShowPasteUrl(false);
    setFormSeoTitle('');
    setFormSeoDesc('');
    setFormDiamondTotalCount('');
    setFormDiamondTotalWeight('');
    setFormSettingType('');
    setFormDiamondGroups([emptyDiamondGroup(), emptyDiamondGroup()]);
    setFormGemstoneTotalCount('');
    setFormGemstoneTotalWeight('');
    setFormGemstoneType('');
    setFormGemstoneColor('');
    setFormGemstoneStoneCount('');
    setFormGemstoneSettingType('');
    setFormGemstoneShape('');
    setFormGemstoneWeightApprox('');
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
    const nextImages = (prod.images || []).map((img) => img.trim()).filter(Boolean);
    const nextVideos = (prod.videos || []).map((url) => url.trim()).filter(Boolean);
    setFormImages(nextImages);
    setFormMainImage(
      prod.mainImage && nextImages.includes(prod.mainImage) ? prod.mainImage : nextImages[0] || ''
    );
    setFormVideos(nextVideos);
    setPasteUrl('');
    setShowPasteUrl(false);
    setFormSeoTitle(prod.seoTitle || '');
    setFormSeoDesc(prod.seoDescription || '');
    setFormDiamondTotalCount(
      prod.diamondDetails?.totalCount != null ? String(prod.diamondDetails.totalCount) : ''
    );
    setFormDiamondTotalWeight(prod.diamondDetails?.totalWeight || '');
    setFormSettingType(prod.diamondDetails?.settingType || '');
    const groups = prod.diamondDetails?.groups || [];
    setFormDiamondGroups([
      { ...emptyDiamondGroup(), ...groups[0] },
      { ...emptyDiamondGroup(), ...groups[1] },
    ]);
    setFormGemstoneTotalCount(
      prod.gemstoneDetails?.totalCount != null ? String(prod.gemstoneDetails.totalCount) : ''
    );
    setFormGemstoneTotalWeight(prod.gemstoneDetails?.totalWeight || '');
    setFormGemstoneType(prod.gemstoneDetails?.type || '');
    setFormGemstoneColor(prod.gemstoneDetails?.color || '');
    setFormGemstoneStoneCount(
      prod.gemstoneDetails?.stoneCount != null ? String(prod.gemstoneDetails.stoneCount) : ''
    );
    setFormGemstoneSettingType(prod.gemstoneDetails?.settingType || '');
    setFormGemstoneShape(prod.gemstoneDetails?.shape || '');
    setFormGemstoneWeightApprox(prod.gemstoneDetails?.weightApprox || '');
    setIsFormOpen(true);
  };

  const handleAddImageUrl = () => {
    setFormImages([...formImages, '']);
    setShowImageUrl([...showImageUrl, false]);
  };

  const handleRemoveImageUrl = (idx: number) => {
    const removed = formImages[idx];
    const nextImages = formImages.filter((_, i) => i !== idx);
    setFormImages(nextImages);
    if (formMainImage === removed) {
      setFormMainImage(nextImages.find((img) => img.trim()) || '');
    }
  };

  const handleImageUrlChange = (idx: number, val: string) => {
    setFormImages((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const fetchLibraryImages = async () => {
    try {
      const res = await fetch('/api/product-media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLibraryImages(Array.isArray(data.images) ? data.images : []);
      setLibraryVideos(Array.isArray(data.videos) ? data.videos : []);
    } catch (err) {
      console.error('Failed to load uploaded media:', err);
    }
  };

  useEffect(() => {
    if (isFormOpen && token) {
      void fetchLibraryImages();
    }
  }, [isFormOpen, token]);

  const addProductImage = (url: string) => {
    const nextUrl = url.trim();
    if (!nextUrl) return;
    setFormImages((prev) => {
      const next = prev.map((item) => item.trim()).filter(Boolean);
      return next.includes(nextUrl) ? next : [...next, nextUrl];
    });
    setFormMainImage((prev) => prev || nextUrl);
    setLibraryImages((prev) => (prev.includes(nextUrl) ? prev : [nextUrl, ...prev]));
  };

  const addProductVideo = (url: string) => {
    const nextUrl = url.trim();
    if (!nextUrl) return;
    setFormVideos((prev) => {
      const next = prev.map((item) => item.trim()).filter(Boolean);
      return next.includes(nextUrl) ? next : [...next, nextUrl];
    });
    setLibraryVideos((prev) => (prev.includes(nextUrl) ? prev : [nextUrl, ...prev]));
  };

  const handleAppendImages = async (files: File[]) => {
    for (const file of files) {
      await new Promise<void>((resolve) => {
        void handleImageFilePick(-1, file).finally(() => resolve());
      });
    }
  };

  const handlePickLibraryImage = (idx: number, url: string) => {
    handleImageUrlChange(idx, url);
    setLibraryOpenFor(null);
  };

  const handleImageFilePick = async (idx: number, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be 8MB or smaller.');
      return;
    }

    setError('');
    setUploadingImageIdx(idx);

    try {
      const { dataUrl, filename } = await prepareImageDataUrl(file, {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 0.82,
      });
      const res = await fetch('/api/product-images', {
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
              : 'Failed to upload image.')
        );
        return;
      }
      addProductImage(payload.url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failure during image upload.');
    } finally {
      setUploadingImageIdx(null);
    }
  };

  const handleAddVideo = () => {
    setFormVideos([...formVideos, '']);
    setShowVideoUrl([...showVideoUrl, false]);
  };

  const handleRemoveVideo = (idx: number) => {
    setFormVideos(formVideos.filter((_, i) => i !== idx));
    setShowVideoUrl(showVideoUrl.filter((_, i) => i !== idx));
  };

  const handleVideoUrlChange = (idx: number, val: string) => {
    setFormVideos((prev) => {
      const updated = [...prev];
      while (updated.length <= idx) updated.push('');
      updated[idx] = val;
      return updated;
    });
  };

  const handleVideoFilePick = async (_startIdx: number, files: File[]) => {
    if (!files.length) return;
    setError('');

    for (let offset = 0; offset < files.length; offset += 1) {
      const file = files[offset];
      const idx = offset;
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowed = file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext);
      if (!allowed) {
        setError('Please choose MP4, WEBM, or MOV videos.');
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('Each video must be 8MB or smaller.');
        continue;
      }

      setUploadingVideoIdx(idx);
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            typeof reader.result === 'string'
              ? resolve(reader.result)
              : reject(new Error('Could not read the selected video.'));
          reader.onerror = () => reject(new Error('Could not read the selected video.'));
          reader.readAsDataURL(file);
        });
        const res = await fetch('/api/product-videos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ filename: file.name, data: dataUrl }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload.url) {
          setError(payload.error || 'Failed to upload video.');
          continue;
        }
        addProductVideo(payload.url);
      } catch (err) {
        console.error('Video upload failed:', err);
        setError(err instanceof Error ? err.message : 'Connection failure during video upload.');
      }
    }
    setUploadingVideoIdx(null);
  };

  const handleDiamondGroupChange = (
    idx: number,
    field: keyof DiamondGroup,
    value: string
  ) => {
    setFormDiamondGroups((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        [field]: field === 'count' ? (value === '' ? undefined : Number(value)) : value,
      };
      return next;
    });
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
    const cleanedVideos = formVideos.map((url) => url.trim()).filter(Boolean);
    const mainImage = cleanedImages.includes(formMainImage) ? formMainImage : cleanedImages[0];

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
      videos: cleanedVideos,
      mainImage,
      seoTitle: formSeoTitle.trim() || `${formName} in Premium ${material} | Lukee Jewels`,
      seoDescription: formSeoDesc.trim() || formShortDesc.trim(),
      diamondDetails: {
        totalCount: formDiamondTotalCount.trim() !== '' ? Number(formDiamondTotalCount) : undefined,
        totalWeight: formDiamondTotalWeight.trim(),
        settingType: formSettingType.trim(),
        groups: formDiamondGroups.map((group) => ({
          count: group.count != null && String(group.count) !== '' ? Number(group.count) : undefined,
          clarity: group.clarity || '',
          color: group.color || '',
          shape: group.shape || '',
          weightApprox: group.weightApprox || '',
        })),
      },
      gemstoneDetails: {
        totalCount: formGemstoneTotalCount.trim() !== '' ? Number(formGemstoneTotalCount) : undefined,
        totalWeight: formGemstoneTotalWeight.trim(),
        type: formGemstoneType.trim(),
        color: formGemstoneColor.trim(),
        stoneCount: formGemstoneStoneCount.trim() !== '' ? Number(formGemstoneStoneCount) : undefined,
        settingType: formGemstoneSettingType.trim(),
        shape: formGemstoneShape.trim(),
        weightApprox: formGemstoneWeightApprox.trim(),
      },
      metalDetails: {
        name: metalNameFromMaterial(material),
        purity: metalPurityLabel(purity),
        weight: `${Number(formWeight) || 1.0}g`,
      },
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

  const attachedImages = formImages.map((url) => url.trim()).filter(Boolean);
  const attachedVideos = formVideos.map((url) => url.trim()).filter(Boolean);
  const mediaList: { type: 'image' | 'video'; url: string; onProduct: boolean }[] = [
    ...attachedImages.map((url) => ({ type: 'image' as const, url, onProduct: true })),
    ...attachedVideos.map((url) => ({ type: 'video' as const, url, onProduct: true })),
    ...libraryImages
      .filter((url) => !attachedImages.includes(url))
      .map((url) => ({ type: 'image' as const, url, onProduct: false })),
    ...libraryVideos
      .filter((url) => !attachedVideos.includes(url))
      .map((url) => ({ type: 'video' as const, url, onProduct: false })),
  ];

  return (
    <div id="admin-products-page" className="space-y-8 font-sans">
      
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold-100 pb-5">
        <div>
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-brand-dark block font-light">Inventory Control</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-gray-800">Products Catalog</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 hover:bg-brand hover:text-white transition-all rounded-sm flex items-center gap-2"
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
            className="w-full text-xs bg-white border border-line py-2 pl-8 pr-3 rounded-sm focus:outline-none focus:border-brand text-gray-700"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
        </div>

        {/* Category selector */}
        <div className="w-full md:w-56 flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-line text-xs px-2.5 py-2 focus:outline-none focus:border-brand text-gray-700 rounded-sm"
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
        <div className="text-center py-10 text-gray-400 text-xs border border-dashed border-line rounded-sm">
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
                      <div className="w-12 h-12 bg-white border border-gray-100 flex-shrink-0 rounded-sm overflow-hidden flex items-center justify-center">
                        {(p.mainImage || p.images?.[0]) ? (
                          <img src={p.mainImage || p.images?.[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <span className="font-serif text-gray-800 text-xs sm:text-sm font-semibold line-clamp-1 block">{p.name}</span>
                        <span className="text-[0.65rem] text-brand-dark uppercase font-light block">{catRef}</span>
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
                          <span className="block font-mono text-brand-dark font-bold">${p.salePrice?.toLocaleString()}</span>
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
                      {p.featured && <span className="inline-block bg-brand text-white text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm mr-1">Featured</span>}
                      {p.bestSeller && <span className="inline-block bg-[#1c1a17] text-gold-200 text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm mr-1">Bestseller</span>}
                      {p.newArrival && <span className="inline-block bg-gold-50 border border-line text-brand-dark text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">New</span>}
                      {p.status === 'inactive' && <span className="inline-block bg-red-50 border border-red-100 text-red-700 text-[0.55rem] uppercase tracking-wider px-1.5 py-0.5 rounded-sm block w-fit mt-1">Archived</span>}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1.5 min-w-[100px]">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 border border-line text-gray-500 hover:text-brand-dark rounded-sm hover:bg-gold-50/20"
                        title="Edit Jewelry Product"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 border border-line text-gray-400 hover:text-red-600 rounded-sm hover:bg-red-50/20"
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
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
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
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
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
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-light"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Full Design Narrative & Specifications</label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Tell the artisan narrative, detailed stone specifications, diamond carats, and polish notes..."
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 resize-none"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Category Sector</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
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
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
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
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                  />
                </div>
              </div>

              {/* Metal Details */}
              <div className="border-t border-gold-100 pt-4 space-y-3">
                <h4 className="font-serif text-sm text-brand-dark font-medium">Metal Details</h4>
                <p className="text-[0.65rem] text-gray-400 font-light">
                  Metal name, purity, and weight are saved with the product and shown on the storefront.
                </p>
              </div>

              {/* Custom metal inputs if selected */}
              {formMaterialIdx === 'custom' && (
                <div className="grid grid-cols-2 gap-4 bg-gold-50/20 border border-gold-100 p-4 rounded-sm">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-brand-dark block font-medium">Custom Alloy name</label>
                    <input
                      type="text"
                      value={formCustomMaterial}
                      onChange={(e) => setFormCustomMaterial(e.target.value)}
                      placeholder="e.g. Brushed Black Titanium"
                      className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-brand-dark block font-medium">Custom Alloy Purity index</label>
                    <input
                      type="text"
                      value={formCustomPurity}
                      onChange={(e) => setFormCustomPurity(e.target.value)}
                      placeholder="e.g. Titanium Grade 5"
                      className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                    />
                  </div>
                </div>
              )}

              {/* Diamond Details */}
              <div className="border-t border-gold-100 pt-4 space-y-4">
                <h4 className="font-serif text-sm text-brand-dark font-medium">Diamond Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Total No. of Diamonds</label>
                    <input
                      type="number"
                      min="0"
                      value={formDiamondTotalCount}
                      onChange={(e) => setFormDiamondTotalCount(e.target.value)}
                      placeholder="e.g. 13"
                      className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Total Weight</label>
                    <input
                      type="text"
                      value={formDiamondTotalWeight}
                      onChange={(e) => setFormDiamondTotalWeight(e.target.value)}
                      placeholder="e.g. 0.22ct"
                      className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Setting Type</label>
                    <input
                      type="text"
                      value={formSettingType}
                      onChange={(e) => setFormSettingType(e.target.value)}
                      placeholder="e.g. Prong / Pavé"
                      className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formDiamondGroups.map((group, idx) => (
                    <div key={idx} className="bg-gold-50/20 border border-gold-100 p-4 rounded-sm space-y-3">
                      <p className="text-[0.65rem] uppercase tracking-wider text-brand-dark font-medium">
                        Diamond Group {idx + 1}
                      </p>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">No of diamonds</label>
                        <input
                          type="number"
                          min="0"
                          value={group.count ?? ''}
                          onChange={(e) => handleDiamondGroupChange(idx, 'count', e.target.value)}
                          placeholder={idx === 0 ? 'e.g. 12' : 'e.g. 1'}
                          className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Clarity</label>
                          <input
                            type="text"
                            value={group.clarity || ''}
                            onChange={(e) => handleDiamondGroupChange(idx, 'clarity', e.target.value)}
                            placeholder="e.g. SI"
                            className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Color</label>
                          <input
                            type="text"
                            value={group.color || ''}
                            onChange={(e) => handleDiamondGroupChange(idx, 'color', e.target.value)}
                            placeholder="e.g. IJ"
                            className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Shape</label>
                          <input
                            type="text"
                            value={group.shape || ''}
                            onChange={(e) => handleDiamondGroupChange(idx, 'shape', e.target.value)}
                            placeholder="e.g. Round"
                            className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Diamond Weight (Approx)</label>
                          <input
                            type="text"
                            value={group.weightApprox || ''}
                            onChange={(e) => handleDiamondGroupChange(idx, 'weightApprox', e.target.value)}
                            placeholder={idx === 0 ? 'e.g. 0.07ct' : 'e.g. 0.15ct'}
                            className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemstone Details */}
              <div className="border-t border-gold-100 pt-4 space-y-4">
                <h4 className="font-serif text-sm text-brand-dark font-medium">Gemstone Details</h4>
                <p className="text-[0.65rem] text-gray-400 font-light">
                  Optional. Filled fields are saved with the product and shown on the product page.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Total No. of Gemstones</label>
                    <input
                      type="number"
                      min="0"
                      value={formGemstoneTotalCount}
                      onChange={(e) => setFormGemstoneTotalCount(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Total Weight</label>
                    <input
                      type="text"
                      value={formGemstoneTotalWeight}
                      onChange={(e) => setFormGemstoneTotalWeight(e.target.value)}
                      placeholder="e.g. 0.280 Ct"
                      className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Type</label>
                    <input
                      type="text"
                      value={formGemstoneType}
                      onChange={(e) => setFormGemstoneType(e.target.value)}
                      placeholder="e.g. Fancy Gemstone"
                      className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                    />
                  </div>
                </div>

                <div className="bg-gold-50/20 border border-gold-100 p-4 rounded-sm space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Color</label>
                      <input
                        type="text"
                        value={formGemstoneColor}
                        onChange={(e) => setFormGemstoneColor(e.target.value)}
                        placeholder="e.g. Green"
                        className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">No of stones</label>
                      <input
                        type="number"
                        min="0"
                        value={formGemstoneStoneCount}
                        onChange={(e) => setFormGemstoneStoneCount(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Setting Type</label>
                      <input
                        type="text"
                        value={formGemstoneSettingType}
                        onChange={(e) => setFormGemstoneSettingType(e.target.value)}
                        placeholder="e.g. Prong"
                        className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Shape</label>
                      <input
                        type="text"
                        value={formGemstoneShape}
                        onChange={(e) => setFormGemstoneShape(e.target.value)}
                        placeholder="e.g. Round"
                        className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 sm:max-w-[calc(50%-0.375rem)]">
                    <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Gemstone Weight (Approx)</label>
                    <input
                      type="text"
                      value={formGemstoneWeightApprox}
                      onChange={(e) => setFormGemstoneWeightApprox(e.target.value)}
                      placeholder="e.g. 0.28 Ct"
                      className="w-full text-xs bg-white border border-line py-2.5 px-3 focus:outline-none rounded-sm font-mono"
                    />
                  </div>
                </div>
              </div>

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
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Promotional Sale Price ($)</label>
                  <input
                    type="number"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    placeholder="e.g. 1950 (optional)"
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3.5 border-t border-gold-100 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-serif text-sm text-brand-dark font-medium">Product media</h4>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-1.5 bg-[#1c1a17] text-gold-200 text-[0.65rem] uppercase tracking-widest font-semibold px-3 py-2 rounded-sm cursor-pointer hover:bg-brand hover:text-white transition-colors">
                      <Upload size={12} />
                      {uploadingImageIdx !== null ? 'Uploading…' : 'Add images'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        className="hidden"
                        disabled={uploadingImageIdx !== null}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          e.target.value = '';
                          files.forEach((file) => {
                            void handleImageFilePick(0, file);
                          });
                        }}
                      />
                    </label>
                    <label className="inline-flex items-center gap-1.5 border border-line text-gray-600 text-[0.65rem] uppercase tracking-widest font-semibold px-3 py-2 rounded-sm cursor-pointer hover:border-brand hover:text-brand-dark">
                      <Film size={12} />
                      {uploadingVideoIdx !== null ? 'Uploading…' : 'Add videos'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                        multiple
                        className="hidden"
                        disabled={uploadingVideoIdx !== null}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          e.target.value = '';
                          void handleVideoFilePick(0, files);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasteUrl((open) => !open)}
                      className="inline-flex items-center gap-1.5 border border-line text-gray-600 text-[0.65rem] uppercase tracking-widest font-semibold px-3 py-2 rounded-sm hover:border-brand hover:text-brand-dark"
                    >
                      <Link2 size={12} />
                      Paste URL
                    </button>
                  </div>
                </div>

                <p className="text-[0.65rem] text-gray-400 leading-relaxed font-light">
                  Images and videos are listed together. Click one to use it on this product. Mark one image as the card image for the product list.
                </p>

                {showPasteUrl && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pasteUrl}
                      onChange={(e) => setPasteUrl(e.target.value)}
                      placeholder="https://… image or video URL"
                      className="flex-1 text-xs bg-white border border-line py-2 px-3 rounded-sm text-gray-600 font-light"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = pasteUrl.trim();
                        if (!url) return;
                        if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) addProductVideo(url);
                        else addProductImage(url);
                        setPasteUrl('');
                      }}
                      className="text-[0.65rem] uppercase tracking-widest font-semibold px-3 py-2 bg-[#1c1a17] text-gold-200 rounded-sm"
                    >
                      Add
                    </button>
                  </div>
                )}

                {mediaList.length === 0 ? (
                  <p className="text-[0.65rem] text-gray-400">No uploaded images or videos yet.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto">
                    {mediaList.map((item) => {
                      const isCard = item.type === 'image' && item.onProduct && formMainImage === item.url;
                      return (
                        <div
                          key={`${item.type}-${item.url}`}
                          className={`relative border rounded-sm overflow-hidden bg-[#fcfbf9] ${
                            item.onProduct ? 'border-brand ring-1 ring-brand' : 'border-line'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (item.type === 'image') {
                                if (item.onProduct) return;
                                addProductImage(item.url);
                              } else if (item.onProduct) {
                                return;
                              } else {
                                addProductVideo(item.url);
                              }
                            }}
                            className="block w-full aspect-square bg-black"
                            title={item.onProduct ? 'On this product' : 'Add to this product'}
                          >
                            {item.type === 'video' ? (
                              <video src={item.url} muted preload="metadata" className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            )}
                          </button>
                          <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                            <span className="text-[0.6rem] uppercase tracking-wider text-gray-400">
                              {item.type === 'video' ? 'Video' : isCard ? 'Card image' : 'Image'}
                            </span>
                            {item.onProduct ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.type === 'image') {
                                    setFormImages((prev) => prev.filter((url) => url !== item.url));
                                    if (formMainImage === item.url) {
                                      setFormMainImage(attachedImages.find((url) => url !== item.url) || '');
                                    }
                                  } else {
                                    setFormVideos((prev) => prev.filter((url) => url !== item.url));
                                  }
                                }}
                                className="text-gray-400 hover:text-red-500"
                                title="Remove from this product"
                              >
                                <X size={12} />
                              </button>
                            ) : (
                              <span className="text-[0.6rem] text-gray-400">Add</span>
                            )}
                          </div>
                          {item.type === 'image' && item.onProduct && !isCard && (
                            <button
                              type="button"
                              onClick={() => setFormMainImage(item.url)}
                              className="w-full text-[0.6rem] uppercase tracking-wider text-brand-dark border-t border-gold-100 py-1 hover:bg-gold-50"
                            >
                              Set as card image
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                      className="rounded text-brand focus:ring-gold-500 border-brand/30"
                    />
                    <span>Featured Flag</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formBestSeller}
                      onChange={(e) => setFormBestSeller(e.target.checked)}
                      className="rounded text-brand focus:ring-gold-500 border-brand/30"
                    />
                    <span>Best Seller Flag</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formNewArrival}
                      onChange={(e) => setFormNewArrival(e.target.checked)}
                      className="rounded text-brand focus:ring-gold-500 border-brand/30"
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
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="inactive">Archived (Vaulted)</option>
                  </select>
                </div>
                
                <div className="space-y-2 col-span-2 pt-2">
                  <h4 className="font-serif text-sm text-brand-dark font-medium">SEO Identifiers</h4>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SEO Title Header</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="Elysian Diamond Solitaire Ring in 18k White Gold | Lukee Jewels"
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[0.65rem] tracking-wider uppercase text-gray-400 block font-medium">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={formSeoDesc}
                    onChange={(e) => setFormSeoDesc(e.target.value)}
                    placeholder="Bespoke engagement diamond ring in pristine condition. Kimberley Process certified..."
                    className="w-full text-xs bg-gray-50 border border-line py-3 px-3.5 focus:outline-none focus:border-brand rounded-sm text-gray-700 resize-none font-light"
                  />
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
                  className="w-1/2 bg-[#1c1a17] text-gold-200 text-xs uppercase tracking-widest py-3 hover:bg-brand hover:text-white transition-all rounded-sm font-semibold"
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
