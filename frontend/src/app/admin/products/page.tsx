'use client';

import { useState, useEffect } from'react';
import api, { getImageUrl } from'@/lib/api';
import { Product } from'@/types';
import { isLoggedIn, isAdmin, formatPrice } from'@/lib/auth';
import { useRouter } from'next/navigation';
import Loader from'@/components/ui/Loader';
import { Plus, Edit, Trash2, Search, Eye } from'lucide-react';
import Link from'next/link';
import Image from'next/image';
import toast from'react-hot-toast';

export default function AdminProductsPage() {
 const [products, setProducts] = useState<Product[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [page, setPage] = useState(1);
 const [total, setTotal] = useState(0);
 const router = useRouter();

 useEffect(() => {
 if (!isLoggedIn() || !isAdmin()) {
 router.push('/auth/login');
 return;
 }
 fetchProducts();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [router, page, search]);

 const fetchProducts = async () => {
 setIsLoading(true);
 try {
 const params: Record<string, string | number> = { page, limit: 20 };
 if (search) params.search = search;
 const res = await api.get('/api/products', { params });
 setProducts(res.data.data);
 setTotal(res.data.pagination.total);
 } finally {
 setIsLoading(false);
 }
 };

 const handleDelete = async (id: string, name: string) => {
 if (!confirm(`Yakin hapus produk"${name}"?`)) return;
 try {
 await api.delete(`/api/products/${id}`);
 toast.success('Produk berhasil dihapus');
 fetchProducts();
 } catch {
 toast.error('Gagal menghapus produk');
 }
 };

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
 <p className="text-sm text-gray-500 mt-1">{total} total produk</p>
 </div>
 <Link
 href="/admin/products/new"
 className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
 >
 <Plus className="w-4 h-4" />
 Tambah Produk
 </Link>
 </div>

 {/* Search */}
 <div className="relative mb-4">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 <input
 type="text"
 placeholder="Cari produk..."
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 className="w-full max-w-sm pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white text-sm"
 />
 </div>

 {isLoading ? (
 <Loader />
 ) : (
 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-gray-50">
 <tr>
 <th className="text-left px-4 py-3 text-gray-600 font-medium">Produk</th>
 <th className="text-left px-4 py-3 text-gray-600 font-medium">Harga</th>
 <th className="text-left px-4 py-3 text-gray-600 font-medium">Stok</th>
 <th className="text-left px-4 py-3 text-gray-600 font-medium">Rating</th>
 <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {products.map((p) => (
 <tr key={p._id} className="hover:bg-gray-50">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
 {p.images?.[0] ? (
 <Image src={getImageUrl(p.images[0])} alt={p.name} fill className="object-cover" />
 ) : (
 <span className="flex items-center justify-center h-full text-lg">📦</span>
 )}
 </div>
 <div>
 <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">{p.name}</p>
 <p className="text-xs text-gray-500">{p.brand}</p>
 </div>
 </div>
 </td>
 <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.price)}</td>
 <td className="px-4 py-3">
 <span className={`font-medium ${p.stock === 0 ?'text-red-500' : p.stock <= 5 ?'text-orange-500' :'text-green-600'}`}>
 {p.stock}
 </span>
 </td>
 <td className="px-4 py-3 text-gray-600">{p.avgRating}/5 ⭐</td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <Link href={`/catalog/${p._id}`} target="_blank" className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50">
 <Eye className="w-4 h-4" />
 </Link>
 <Link href={`/admin/products/${p._id}`} className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
 <Edit className="w-4 h-4" />
 </Link>
 <button
 onClick={() => handleDelete(p._id, p.name)}
 className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 {products.length === 0 && (
 <p className="text-center py-12 text-gray-500">Tidak ada produk ditemukan</p>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
