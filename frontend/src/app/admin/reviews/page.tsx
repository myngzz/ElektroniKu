'use client';

import { useState, useEffect } from'react';
import { useRouter } from'next/navigation';
import api, { getImageUrl } from'@/lib/api';
import { isLoggedIn, isAdmin, formatDate } from'@/lib/auth';
import toast from'react-hot-toast';
import Loader from'@/components/ui/Loader';
import RatingStars from'@/components/ui/RatingStars';
import { MessageSquare, Trash2, Search, ChevronLeft, ChevronRight } from'lucide-react';
import Image from'next/image';
import Link from'next/link';

interface AdminReview {
 _id: string;
 rating: number;
 comment: string;
 createdAt: string;
 user: { _id: string; name: string; email: string };
 product: { _id: string; name: string; brand: string; images: string[] };
}

export default function AdminReviewsPage() {
 const [reviews, setReviews] = useState<AdminReview[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [ratingFilter, setRatingFilter] = useState('');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const router = useRouter();

 useEffect(() => {
 if (!isLoggedIn() || !isAdmin()) {
 router.push('/auth/login');
 return;
 }
 fetchReviews();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [router, page, ratingFilter]);

 const fetchReviews = async () => {
 setIsLoading(true);
 try {
 const params: Record<string, string | number> = { page, limit: 20 };
 if (ratingFilter) params.rating = ratingFilter;
 const res = await api.get('/api/admin/reviews', { params });
 setReviews(res.data.data);
 setTotalPages(res.data.pagination.pages);
 } finally {
 setIsLoading(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm('Yakin hapus review ini?')) return;
 try {
 await api.delete(`/api/admin/reviews/${id}`);
 toast.success('Review dihapus');
 setReviews((prev) => prev.filter((r) => r._id !== id));
 } catch {
 toast.error('Gagal menghapus review');
 }
 };

 const filtered = search
 ? reviews.filter(
 (r) =>
 r.comment.toLowerCase().includes(search.toLowerCase()) ||
 r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
 r.product?.name?.toLowerCase().includes(search.toLowerCase())
 )
 : reviews;

 if (isLoading) return <Loader text="Memuat review..." />;

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between mb-6">
 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
 <MessageSquare className="w-6 h-6" /> Moderasi Review
 </h1>
 <span className="text-sm text-gray-500">{reviews.length} review</span>
 </div>

 {/* Filters */}
 <div className="flex gap-3 mb-4">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
 <input
 type="text"
 placeholder="Cari komentar, user, atau produk..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none"
 />
 </div>
 <select
 value={ratingFilter}
 onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
 className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none"
 >
 <option value="">Semua Rating</option>
 {[5, 4, 3, 2, 1].map((r) => (
 <option key={r} value={r}>Bintang {r}</option>
 ))}
 </select>
 </div>

 {/* Reviews list */}
 <div className="space-y-3">
 {filtered.map((review) => (
 <div key={review._id} className="bg-white rounded-2xl border border-gray-100 p-5">
 <div className="flex gap-4">
 {/* Product thumb */}
 <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
 {review.product?.images?.[0] ? (
 <Image
 src={getImageUrl(review.product.images[0])}
 alt={review.product.name}
 width={56} height={56}
 className="object-contain w-full h-full p-1"
 />
 ) : (
 <div className="flex items-center justify-center h-full text-xl">📦</div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <div>
 <Link
 href={`/catalog/${review.product?._id}`}
 className="text-sm font-medium text-gray-900 hover:underline line-clamp-1"
 >
 {review.product?.name ||'Produk tidak ditemukan'}
 </Link>
 <p className="text-xs text-gray-500">{review.product?.brand}</p>
 </div>
 <button
 onClick={() => handleDelete(review._id)}
 className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
 title="Hapus review"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 <div className="flex items-center gap-2 mt-1.5">
 <RatingStars rating={review.rating} size="sm" />
 <span className="text-xs text-gray-500">
 oleh <span className="font-medium text-gray-700">{review.user?.name}</span>
 </span>
 <span className="text-xs text-gray-400">· {formatDate(review.createdAt)}</span>
 </div>
 <p className="text-sm text-gray-600 mt-2 line-clamp-3">{review.comment}</p>
 </div>
 </div>
 </div>
 ))}
 </div>

 {filtered.length === 0 && (
 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
 <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
 <p className="text-gray-500">Tidak ada review ditemukan</p>
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 mt-6">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page === 1}
 className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="text-sm text-gray-600">
 Hal {page} / {totalPages}
 </span>
 <button
 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
 disabled={page === totalPages}
 className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
 >
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>
 </div>
 );
}
