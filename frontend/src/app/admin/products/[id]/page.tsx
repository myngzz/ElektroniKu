'use client';

import { useState, useEffect, use } from'react';
import { useRouter } from'next/navigation';
import api, { getImageUrl } from'@/lib/api';
import { Category, Product } from'@/types';
import { isLoggedIn, isAdmin } from'@/lib/auth';
import toast from'react-hot-toast';
import { ArrowLeft, Sparkles, Upload, X } from'lucide-react';
import Link from'next/link';
import { AILoader } from'@/components/ui/Loader';
import Image from'next/image';

interface PageProps {
 params: Promise<{ id: string }>;
}

export default function AdminProductFormPage({ params }: PageProps) {
 const { id } = use(params);
 const isNew = id ==='new';
 const router = useRouter();

 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [aiDescLoading, setAiDescLoading] = useState(false);
 const [uploadingImage, setUploadingImage] = useState(false);

 const [form, setForm] = useState({
 name:'',
 brand:'',
 category:'',
 price:'',
 originalPrice:'',
 stock:'',
 description:'',
 isFeatured: false,
 specifications: {} as Record<string, string>,
 images: [] as string[],
 tags:'',
 });

 const [newSpecKey, setNewSpecKey] = useState('');
 const [newSpecValue, setNewSpecValue] = useState('');

 useEffect(() => {
 if (!isLoggedIn() || !isAdmin()) {
 router.push('/auth/login');
 return;
 }
 const fetchData = async () => {
 setIsLoading(true);
 try {
 const catRes = await api.get('/api/categories');
 setCategories(catRes.data.data);

 if (!isNew) {
 const productRes = await api.get(`/api/products/${id}`);
 const p: Product = productRes.data.data;
 const specs = p.specifications instanceof Map
 ? Object.fromEntries(p.specifications)
 : (p.specifications as Record<string, string> || {});

 setForm({
 name: p.name,
 brand: p.brand,
 category: typeof p.category ==='object' ? (p.category as Category)._id : p.category,
 price: String(p.price),
 originalPrice: String(p.originalPrice ||''),
 stock: String(p.stock),
 description: p.description ||'',
 isFeatured: p.isFeatured,
 specifications: Object.fromEntries(Object.entries(specs).map(([k, v]) => [k, String(v)])),
 images: p.images || [],
 tags: (p.tags || []).join(','),
 });
 }
 } finally {
 setIsLoading(false);
 }
 };
 fetchData();
 }, [id, isNew, router]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSaving(true);
 try {
 const payload = {
 name: form.name,
 brand: form.brand,
 category: form.category,
 price: Number(form.price),
 originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
 stock: Number(form.stock),
 description: form.description,
 isFeatured: form.isFeatured,
 specifications: form.specifications,
 images: form.images,
 tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
 };

 if (isNew) {
 await api.post('/api/products', payload);
 toast.success('Produk berhasil dibuat!');
 } else {
 await api.put(`/api/products/${id}`, payload);
 toast.success('Produk berhasil diupdate!');
 }
 router.push('/admin/products');
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string; errors?: Array<{msg: string}> } } };
 const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message ||'Gagal menyimpan produk';
 toast.error(msg);
 } finally {
 setIsSaving(false);
 }
 };

 const handleGenerateDescription = async () => {
 if (!form.name || !form.brand) {
 toast.error('Isi nama dan brand produk terlebih dahulu');
 return;
 }
 setAiDescLoading(true);
 try {
 const res = await api.post('/api/ai/generate-description', {
 productName: form.name,
 brand: form.brand,
 category: categories.find((c) => c._id === form.category)?.name,
 specs: form.specifications,
 });
 setForm((prev) => ({ ...prev, description: res.data.data.description }));
 toast.success('Deskripsi AI berhasil dibuat!');
 } catch {
 toast.error('AI tidak tersedia saat ini');
 } finally {
 setAiDescLoading(false);
 }
 };

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setUploadingImage(true);
 try {
 const formData = new FormData();
 formData.append('image', file);
 formData.append('folder','products');

 const res = await api.post('/api/upload', formData, {
 headers: {'Content-Type':'multipart/form-data' },
 });
 setForm((prev) => ({ ...prev, images: [...prev.images, res.data.data.url] }));
 toast.success('Gambar berhasil diupload!');
 } catch {
 toast.error('Gagal upload gambar');
 } finally {
 setUploadingImage(false);
 }
 };

 const addSpec = () => {
 if (!newSpecKey || !newSpecValue) return;
 setForm((prev) => ({
 ...prev,
 specifications: { ...prev.specifications, [newSpecKey]: newSpecValue },
 }));
 setNewSpecKey('');
 setNewSpecValue('');
 };

 const removeSpec = (key: string) => {
 setForm((prev) => {
 const specs = { ...prev.specifications };
 delete specs[key];
 return { ...prev, specifications: specs };
 });
 };

 if (isLoading) return <div className="text-center py-16">Memuat...</div>;

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
 <div className="flex items-center gap-3 mb-6">
 <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100">
 <ArrowLeft className="w-4 h-4" />
 </Link>
 <h1 className="text-xl font-bold text-gray-900">
 {isNew ?'Tambah Produk Baru' :'Edit Produk'}
 </h1>
 </div>

 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Basic Info */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <h2 className="font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk *</label>
 <input
 type="text"
 required
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
 placeholder="Samsung Galaxy S24 Ultra"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand *</label>
 <input
 type="text"
 required
 value={form.brand}
 onChange={(e) => setForm({ ...form, brand: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
 placeholder="Samsung"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori *</label>
 <select
 required
 value={form.category}
 onChange={(e) => setForm({ ...form, category: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
 >
 <option value="">Pilih kategori</option>
 {categories.map((c) => (
 <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok *</label>
 <input
 type="number"
 required
 min="0"
 value={form.stock}
 onChange={(e) => setForm({ ...form, stock: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
 placeholder="50"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp) *</label>
 <input
 type="number"
 required
 min="0"
 value={form.price}
 onChange={(e) => setForm({ ...form, price: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
 placeholder="18999000"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Asli (opsional)</label>
 <input
 type="number"
 min="0"
 value={form.originalPrice}
 onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
 placeholder="21999000"
 />
 </div>
 </div>
 <div className="mt-4 flex items-center gap-2">
 <input
 type="checkbox"
 id="featured"
 checked={form.isFeatured}
 onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
 className="w-4 h-4 rounded"
 />
 <label htmlFor="featured" className="text-sm text-gray-700">Produk Unggulan (Featured)</label>
 </div>
 </div>

 {/* Description */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-semibold text-gray-900">Deskripsi</h2>
 <button
 type="button"
 onClick={handleGenerateDescription}
 disabled={aiDescLoading}
 className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
 >
 {aiDescLoading ? <AILoader text="" /> : <Sparkles className="w-4 h-4" />}
 {aiDescLoading ?'AI Membuat...' :'Generate AI'}
 </button>
 </div>
 <textarea
 rows={6}
 value={form.description}
 onChange={(e) => setForm({ ...form, description: e.target.value })}
 placeholder="Deskripsi produk... (atau gunakan tombol Generate AI)"
 className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none"
 />
 </div>

 {/* Specifications */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <h2 className="font-semibold text-gray-900 mb-4">Spesifikasi Teknis</h2>

 {/* Existing specs */}
 <div className="space-y-2 mb-4">
 {Object.entries(form.specifications).map(([key, value]) => (
 <div key={key} className="flex items-center gap-2">
 <input value={key} readOnly className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 font-medium" />
 <span className="text-gray-400">:</span>
 <input
 value={value}
 onChange={(e) => setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [key]: e.target.value } }))}
 className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
 />
 <button type="button" onClick={() => removeSpec(key)} className="p-1.5 text-red-400 hover:text-red-600">
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>

 {/* Add spec */}
 <div className="flex gap-2">
 <input
 value={newSpecKey}
 onChange={(e) => setNewSpecKey(e.target.value)}
 placeholder="Nama (misal: RAM)"
 className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
 />
 <input
 value={newSpecValue}
 onChange={(e) => setNewSpecValue(e.target.value)}
 placeholder="Nilai (misal: 8GB)"
 className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
 onKeyPress={(e) => e.key ==='Enter' && (e.preventDefault(), addSpec())}
 />
 <button
 type="button"
 onClick={addSpec}
 className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
 >
 Tambah
 </button>
 </div>
 </div>

 {/* Images */}
 <div className="bg-white rounded-2xl border border-gray-100 p-6">
 <h2 className="font-semibold text-gray-900 mb-4">Gambar Produk</h2>
 <div className="flex gap-3 flex-wrap mb-4">
 {form.images.map((img, i) => (
 <div key={i} className="relative">
 <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
 <Image src={getImageUrl(img)} alt={`Gambar ${i+1}`} fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src =''; }} />
 </div>
 <button
 type="button"
 onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
 className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ))}
 <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
 {uploadingImage ? (
 <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
 ) : (
 <>
 <Upload className="w-4 h-4 text-gray-400" />
 <span className="text-xs text-gray-400">Upload</span>
 </>
 )}
 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
 </label>
 </div>
 </div>

 {/* Submit */}
 <div className="flex gap-3 justify-end">
 <Link href="/admin/products" className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
 Batal
 </Link>
 <button
 type="submit"
 disabled={isSaving}
 className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
 >
 {isSaving ?'Menyimpan...' : isNew ?'Buat Produk' :'Simpan Perubahan'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
