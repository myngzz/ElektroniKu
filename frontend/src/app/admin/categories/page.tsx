'use client';

import { useState, useEffect } from'react';
import { useRouter } from'next/navigation';
import api from'@/lib/api';
import { Category, SpecField } from'@/types';
import { isLoggedIn, isAdmin } from'@/lib/auth';
import toast from'react-hot-toast';
import Loader from'@/components/ui/Loader';
import { Tag, Plus, Pencil, Trash2, X, Check } from'lucide-react';

const emptyForm = {
 name:'',
 slug:'',
 description:'',
 icon:'📦',
 specFields: [] as SpecField[],
};

export default function AdminCategoriesPage() {
 const [categories, setCategories] = useState<Category[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [editId, setEditId] = useState<string | null>(null);
 const [isSaving, setIsSaving] = useState(false);
 const [form, setForm] = useState(emptyForm);
 const [newSpec, setNewSpec] = useState({ key:'', label:'', unit:'', type:'text' as SpecField['type'] });
 const router = useRouter();

 useEffect(() => {
 if (!isLoggedIn() || !isAdmin()) {
 router.push('/auth/login');
 return;
 }
 fetchCategories();
 }, [router]);

 const fetchCategories = async () => {
 setIsLoading(true);
 try {
 const res = await api.get('/api/categories');
 setCategories(res.data.data);
 } finally {
 setIsLoading(false);
 }
 };

 const openCreate = () => {
 setForm(emptyForm);
 setEditId(null);
 setShowForm(true);
 };

 const openEdit = (cat: Category) => {
 setForm({
 name: cat.name,
 slug: cat.slug,
 description: cat.description ||'',
 icon: cat.icon,
 specFields: cat.specFields || [],
 });
 setEditId(cat._id);
 setShowForm(true);
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSaving(true);
 try {
 if (editId) {
 await api.put(`/api/categories/${editId}`, form);
 toast.success('Kategori berhasil diperbarui');
 } else {
 await api.post('/api/categories', form);
 toast.success('Kategori berhasil ditambahkan');
 }
 setShowForm(false);
 fetchCategories();
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } } };
 toast.error(err.response?.data?.message ||'Gagal menyimpan kategori');
 } finally {
 setIsSaving(false);
 }
 };

 const handleDelete = async (id: string, name: string) => {
 if (!confirm(`Yakin hapus kategori"${name}"? Produk di kategori ini tidak akan terhapus.`)) return;
 try {
 await api.delete(`/api/categories/${id}`);
 toast.success('Kategori dihapus');
 fetchCategories();
 } catch {
 toast.error('Gagal menghapus kategori');
 }
 };

 const addSpecField = () => {
 if (!newSpec.key || !newSpec.label) { toast.error('Key dan label wajib diisi'); return; }
 setForm((prev) => ({ ...prev, specFields: [...prev.specFields, { ...newSpec }] }));
 setNewSpec({ key:'', label:'', unit:'', type:'text' });
 };

 const removeSpecField = (index: number) => {
 setForm((prev) => ({ ...prev, specFields: prev.specFields.filter((_, i) => i !== index) }));
 };

 if (isLoading) return <Loader text="Memuat kategori..." />;

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between mb-6">
 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
 <Tag className="w-6 h-6" /> Kelola Kategori
 </h1>
 <button
 onClick={openCreate}
 className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
 >
 <Plus className="w-4 h-4" /> Tambah Kategori
 </button>
 </div>

 {/* Categories grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {categories.map((cat) => (
 <div key={cat._id} className="bg-white rounded-2xl border border-gray-100 p-5">
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center gap-3">
 <span className="text-3xl">{cat.icon}</span>
 <div>
 <p className="font-semibold text-gray-900">{cat.name}</p>
 <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
 </div>
 </div>
 <div className="flex gap-1">
 <button
 onClick={() => openEdit(cat)}
 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
 >
 <Pencil className="w-4 h-4" />
 </button>
 <button
 onClick={() => handleDelete(cat._id, cat.name)}
 className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 {cat.description && (
 <p className="text-xs text-gray-500 mb-2 line-clamp-2">{cat.description}</p>
 )}
 {cat.specFields?.length > 0 && (
 <p className="text-xs text-gray-400">{cat.specFields.length} field spesifikasi</p>
 )}
 </div>
 ))}
 </div>

 {categories.length === 0 && (
 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
 <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
 <p className="text-gray-500">Belum ada kategori</p>
 </div>
 )}
 </div>

 {/* Form Modal */}
 {showForm && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between p-6 border-b border-gray-100">
 <h2 className="font-semibold text-gray-900">
 {editId ?'Edit Kategori' :'Tambah Kategori'}
 </h2>
 <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
 <X className="w-5 h-5" />
 </button>
 </div>
 <form onSubmit={handleSave} className="p-6 space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">Nama *</label>
 <input
 type="text" required value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900"
 />
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">Ikon (emoji)</label>
 <input
 type="text" value={form.icon}
 onChange={(e) => setForm({ ...form, icon: e.target.value })}
 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900"
 />
 </div>
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">Slug (otomatis dari nama)</label>
 <input
 type="text" value={form.slug}
 onChange={(e) => setForm({ ...form, slug: e.target.value })}
 placeholder="akan-di-generate-otomatis"
 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 font-mono"
 />
 </div>
 <div>
 <label className="text-xs font-medium text-gray-700 mb-1 block">Deskripsi</label>
 <textarea
 value={form.description}
 onChange={(e) => setForm({ ...form, description: e.target.value })}
 rows={2}
 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:border-gray-900 resize-none"
 />
 </div>

 {/* Spec Fields */}
 <div>
 <label className="text-xs font-medium text-gray-700 mb-2 block">Field Spesifikasi</label>
 {form.specFields.map((sf, i) => (
 <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2 mb-2">
 <span className="font-mono text-gray-600">{sf.key}</span>
 <span className="text-gray-400">→</span>
 <span className="text-gray-700">{sf.label}</span>
 {sf.unit && <span className="text-gray-400">({sf.unit})</span>}
 <span className="ml-auto text-gray-400">{sf.type}</span>
 <button type="button" onClick={() => removeSpecField(i)} className="text-red-400 hover:text-red-600">
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 ))}
 <div className="grid grid-cols-2 gap-2 mt-2">
 <input
 type="text" placeholder="key (e.g. ram)" value={newSpec.key}
 onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
 className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-900 focus:outline-none font-mono"
 />
 <input
 type="text" placeholder="label (e.g. RAM)" value={newSpec.label}
 onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })}
 className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-900 focus:outline-none"
 />
 <input
 type="text" placeholder="unit (e.g. GB)" value={newSpec.unit}
 onChange={(e) => setNewSpec({ ...newSpec, unit: e.target.value })}
 className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-900 focus:outline-none"
 />
 <select
 value={newSpec.type}
 onChange={(e) => setNewSpec({ ...newSpec, type: e.target.value as SpecField['type'] })}
 className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-900 focus:outline-none"
 >
 <option value="text">text</option>
 <option value="number">number</option>
 <option value="boolean">boolean</option>
 <option value="select">select</option>
 </select>
 </div>
 <button
 type="button" onClick={addSpecField}
 className="mt-2 flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
 >
 <Plus className="w-3.5 h-3.5" /> Tambah Field
 </button>
 </div>

 <div className="flex gap-3 pt-2">
 <button
 type="button" onClick={() => setShowForm(false)}
 className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
 >
 Batal
 </button>
 <button
 type="submit" disabled={isSaving}
 className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
 >
 <Check className="w-4 h-4" />
 {isSaving ?'Menyimpan...' :'Simpan'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
