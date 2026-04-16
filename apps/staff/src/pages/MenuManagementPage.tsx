// ═══════════════════════════════════════════
// DineSmart — Menu Management Page
// ═══════════════════════════════════════════

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories, getMenuItems, toggleAvailability } from '../lib/api';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Leaf, Eye, EyeOff, Search, ImagePlus, X as XIcon, Pencil } from 'lucide-react';

interface MenuItem {
  id: string; categoryId: string; name: string; description: string; price: number; imageUrl: string | null;
  isVeg: boolean; isAvailable: boolean; preparationTimeMinutes: number; orderCount: number;
  category: { name: string }; variants: Array<{ name: string; additionalPrice: number }>;
  menuItemAddons: Array<{ addon: { name: string; price: number } }>;
}

interface Category { id: string; name: string; sortOrder: number; isActive: boolean; _count: { menuItems: number } }

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => getCategories() as Promise<Category[]>,
  });

  const { data: items } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: () => getMenuItems() as Promise<MenuItem[]>,
  });

  const handleToggle = async (id: string) => {
    try {
      await toggleAvailability(id);
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Availability toggled');
    } catch { toast.error('Failed to update'); }
  };

  const filteredItems = items?.filter((item) => {
    if (categoryFilter !== 'all' && item.category.name !== categoryFilter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isVeg: true,
    preparationTimeMinutes: '15',
    imageUrl: '',
  });

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setUploadingImage(true);
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/v1/menu/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      setFormData(prev => ({ ...prev, imageUrl: data.data.url }));
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) { toast.error('Please select a category'); return; }
    setIsSubmitting(true);
    try {
      const isEditing = !!editItemId;
      const url = isEditing ? `/api/v1/menu/items/${editItemId}` : '/api/v1/menu/items';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          preparationTimeMinutes: parseInt(formData.preparationTimeMinutes),
          imageUrl: formData.imageUrl || (isEditing ? undefined : null), // send undefined if editing and we don't want to nullify unexpectedly, wait actually we want to explicitly save the imageUrl state
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast.success(isEditing ? 'Menu item updated' : 'Menu item created');
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsCreating(false);
      setImagePreview(null);
      setEditItemId(null);
      setFormData({ name: '', description: '', price: '', categoryId: '', isVeg: true, preparationTimeMinutes: '15', imageUrl: '' });
    } catch (err: any) { toast.error(err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Menu Management</h1>
          <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>{categories?.length || 0} categories</span>
            <span>•</span>
            <span>{items?.length || 0} items</span>
          </div>
        </div>
        <button 
            onClick={() => {
                setEditItemId(null);
                setFormData({ name: '', description: '', price: '', categoryId: '', isVeg: true, preparationTimeMinutes: '15', imageUrl: '' });
                setImagePreview(null);
                setIsCreating(true);
            }} 
            className="bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* Categories Overview */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            categoryFilter === 'all' ? 'bg-brand-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700'
          }`}
        >All ({items?.length || 0})</button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.name)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              categoryFilter === cat.name ? 'bg-brand-500 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-700'
            }`}
          >{cat.name} ({cat._count.menuItems})</button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4">Item</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-center py-3 px-4">Price</th>
              <th className="text-center py-3 px-4">Orders</th>
              <th className="text-center py-3 px-4">Prep Time</th>
              <th className="text-center py-3 px-4">Status</th>
              <th className="text-center py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems?.map((item) => (
              <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700/30 hover:bg-slate-100 dark:bg-slate-700/10 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        item.isVeg ? '🥗' : '🍗'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-sm border ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                          <span className={`block w-1 h-1 rounded-full m-[1.5px] ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">{item.category.name}</td>
                <td className="py-3 px-4 text-sm font-semibold text-center">₹{item.price}</td>
                <td className="py-3 px-4 text-sm text-center text-slate-500 dark:text-slate-400">{item.orderCount}</td>
                <td className="py-3 px-4 text-xs text-center text-slate-500">{item.preparationTimeMinutes}m</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    item.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleToggle(item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-700 transition-colors"
                        title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                      >
                        {item.isAvailable ? <Eye size={16} className="text-emerald-400" /> : <EyeOff size={16} className="text-red-400" />}
                      </button>
                      <button
                        onClick={() => {
                            setEditItemId(item.id);
                            setFormData({
                                name: item.name,
                                description: item.description,
                                price: item.price.toString(),
                                categoryId: item.categoryId,
                                isVeg: item.isVeg,
                                preparationTimeMinutes: item.preparationTimeMinutes.toString(),
                                imageUrl: item.imageUrl || '',
                            });
                            setImagePreview(item.imageUrl);
                            setIsCreating(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors group"
                        title="Edit Item"
                      >
                          <Pencil size={14} className="text-slate-400 group-hover:text-brand-500" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {editItemId ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Item Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (₹)</label>
                  <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Prep Time (mins)</label>
                  <input required type="number" min="0" value={formData.preparationTimeMinutes} onChange={e => setFormData({ ...formData, preparationTimeMinutes: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                  <option value="" disabled>Select Category</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Item Image (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, imageUrl: '' })); }}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                    >
                      <XIcon size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-400 transition-colors"
                  >
                    <ImagePlus size={24} />
                    <span className="text-xs font-medium">Click to upload image</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isVeg" checked={formData.isVeg} onChange={e => setFormData({ ...formData, isVeg: e.target.checked })} className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500" />
                <label htmlFor="isVeg" className="text-sm font-medium text-slate-700 dark:text-slate-300">Vegetarian 🟢</label>
              </div>
              
              <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
