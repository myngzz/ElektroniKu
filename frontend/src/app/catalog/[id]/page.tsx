'use client';

import { useState, useEffect, use } from'react';
import { useRouter } from'next/navigation';
import Image from'next/image';
import Link from'next/link';
import api, { getImageUrl } from'@/lib/api';
import { Product, Review, Category } from'@/types';
import SpecTable from'@/components/product/SpecTable';
import RatingStars from'@/components/ui/RatingStars';
import Loader, { AILoader } from'@/components/ui/Loader';
import { formatPrice, formatDate, isLoggedIn } from'@/lib/auth';
import {
 Heart, Share2, ChevronLeft, Star,
 Sparkles, ArrowRight, Package
} from'lucide-react';
import toast from'react-hot-toast';
import ReactMarkdown from'react-markdown';

interface PageProps {
 params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
 const { id } = use(params);
 const router = useRouter();

 const [product, setProduct] = useState<Product | null>(null);
 const [reviews, setReviews] = useState<Review[]>([]);
 const [selectedImage, setSelectedImage] = useState(0);
 const [isLoading, setIsLoading] = useState(true);
 const [addingToWishlist, setAddingToWishlist] = useState(false);

 // Review form
 const [reviewRating, setReviewRating] = useState(5);
 const [reviewComment, setReviewComment] = useState('');
 const [isSubmittingReview, setIsSubmittingReview] = useState(false);

 // AI states
 const [aiSummary, setAiSummary] = useState('');
 const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
 const [aiDescription, setAiDescription] = useState('');
 const [aiDescLoading, setAiDescLoading] = useState(false);
 const [activeTab, setActiveTab] = useState<'specs' |'reviews' |'ai'>('specs');

 useEffect(() => {
 const fetchProduct = async () => {
 try {
 const [productRes, reviewRes] = await Promise.allSettled([
 api.get(`/api/products/${id}`),
 api.get(`/api/products/${id}/reviews`),
 ]);

 if (productRes.status ==='fulfilled') {
 setProduct(productRes.value.data.data);
 } else {
 toast.error('Produk tidak ditemukan');
 router.push('/catalog');
 }
 if (reviewRes.status ==='fulfilled') {
 setReviews(reviewRes.value.data.data || []);
 }
 } finally {
 setIsLoading(false);
 }
 };
 fetchProduct();
 }, [id, router]);

 const handleAddToWishlist = async () => {
 if (!isLoggedIn()) {
 router.push('/auth/login?redirect=/catalog/' + id);
 return;
 }
 setAddingToWishlist(true);
 try {
 await api.post('/api/wishlist', { productId: id });
 toast.success('Ditambahkan ke wishlist!');
 } catch {
 toast.error('Gagal menambah ke wishlist');
 } finally {
 setAddingToWishlist(false);
 }
 };

 const handleSubmitReview = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!isLoggedIn()) {
 router.push('/auth/login');
 return;
 }
 setIsSubmittingReview(true);
 try {
 const res = await api.post(`/api/products/${id}/reviews`, {
 rating: reviewRating,
 comment: reviewComment,
 });
 setReviews((prev) => [res.data.data, ...prev]);
 setReviewComment('');
 setReviewRating(5);
 toast.success('Ulasan berhasil dikirim!');
 } catch (error: unknown) {
 const err = error as { response?: { data?: { message?: string } } };
 toast.error(err.response?.data?.message ||'Gagal mengirim ulasan');
 } finally {
 setIsSubmittingReview(false);
 }
 };

 const handleGetAISummary = async () => {
 if (aiSummary) return; // Sudah ada
 setAiSummaryLoading(true);
 try {
 const res = await api.post('/api/ai/summarize-reviews', { productId: id });
 const data = res.data.data;
 setAiSummary(JSON.stringify(data));
 } catch {
 toast.error('AI tidak tersedia saat ini, coba lagi nanti');
 } finally {
 setAiSummaryLoading(false);
 }
 };

 const handleGetAIDescription = async () => {
 if (aiDescription) return;
 setAiDescLoading(true);
 try {
 const res = await api.post('/api/ai/generate-description', { productId: id });
 setAiDescription(res.data.data.description);
 } catch {
 toast.error('AI tidak tersedia saat ini');
 } finally {
 setAiDescLoading(false);
 }
 };

 if (isLoading) return <Loader text="Memuat detail produk..." />;
 if (!product) return null;

 const category = typeof product.category ==='object' ? product.category as Category : null;
 const discount = product.originalPrice && product.originalPrice > product.price
 ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
 : 0;

 const images = product.images?.length > 0 ? product.images.map(getImageUrl) : [''];

 let parsedAiSummary: { summary?: string; positives?: string[]; negatives?: string[]; recommendation?: string; sentimentScore?: number; reviewCount?: number } | null = null;
 try {
 if (aiSummary) parsedAiSummary = JSON.parse(aiSummary);
 } catch { /* ignore */ }

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
 {/* Breadcrumb */}
 <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
 <Link href="/catalog" className="flex items-center gap-1 hover:text-gray-900">
 <ChevronLeft className="w-4 h-4" /> Katalog
 </Link>
 {category && (
 <>
 <span>/</span>
 <Link href={`/catalog?category=${category.slug}`} className="hover:text-gray-900">{category.name}</Link>
 </>
 )}
 <span>/</span>
 <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
 {/* Image Gallery */}
 <div>
 <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 mb-3">
 {images[selectedImage] ? (
 <Image
 src={images[selectedImage]}
 alt={product.name}
 fill
 className="object-contain p-6"
 priority
 onError={(e) => {
 (e.target as HTMLImageElement).src ="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='80'%3E📦%3C/text%3E%3C/svg%3E";
 }}
 />
 ) : (
 <div className="flex items-center justify-center h-full text-8xl">📦</div>
 )}
 </div>
 {images.length > 1 && (
 <div className="flex gap-2 overflow-x-auto pb-1">
 {images.map((img, i) => (
 <button
 key={i}
 onClick={() => setSelectedImage(i)}
 className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-colors ${selectedImage === i ?'border-gray-700' :'border-gray-200'}`}
 >
 <Image src={img} alt={`Gambar ${i + 1}`} fill className="object-cover" />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Product Info */}
 <div>
 {category && (
 <Link href={`/catalog?category=${category.slug}`} className="text-sm text-gray-900 hover:underline mb-1 block">
 {category.icon} {category.name}
 </Link>
 )}
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
 <p className="text-gray-500 mb-3">{product.brand}</p>

 {/* Rating */}
 <div className="flex items-center gap-3 mb-4">
 <RatingStars rating={product.avgRating} size="md" />
 <span className="text-sm text-gray-600">
 {product.avgRating}/5 ({product.reviewCount} ulasan)
 </span>
 </div>

 {/* Price */}
 <div className="flex items-end gap-3 mb-4">
 <span className="text-3xl font-bold text-gray-900">
 {formatPrice(product.price)}
 </span>
 {discount > 0 && (
 <>
 <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice!)}</span>
 <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
 -{discount}%
 </span>
 </>
 )}
 </div>

 {/* Stock */}
 <div className="flex items-center gap-2 mb-6 text-sm">
 <Package className="w-4 h-4 text-gray-400" />
 {product.stock > 0 ? (
 <span className={product.stock <= 5 ?'text-orange-500 font-medium' :'text-green-600'}>
 {product.stock <= 5 ? `Sisa ${product.stock} unit!` : `Stok tersedia (${product.stock} unit)`}
 </span>
 ) : (
 <span className="text-red-500 font-medium">Stok habis</span>
 )}
 </div>

 {/* Actions */}
 <div className="flex gap-3 mb-6">
 <button
 onClick={handleAddToWishlist}
 disabled={addingToWishlist}
 className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
 >
 <Heart className="w-5 h-5" />
 {addingToWishlist ?'Menambahkan...' :'Tambah ke Wishlist'}
 </button>
 <button
 onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link disalin!'); }}
 className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
 >
 <Share2 className="w-5 h-5" />
 </button>
 </div>

 {/* Compare Link */}
 <Link href={`/compare?ids=${id}`} className="flex items-center gap-1.5 text-sm text-gray-700 hover:underline">
 <Sparkles className="w-4 h-4" />
 Bandingkan dengan produk lain
 <ArrowRight className="w-3 h-3" />
 </Link>
 </div>
 </div>

 {/* Tabs */}
 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
 <div className="flex border-b border-gray-100">
 {(['specs','reviews','ai'] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => { setActiveTab(tab); if (tab ==='ai') handleGetAIDescription(); if (tab ==='reviews' && reviews.length > 0) handleGetAISummary(); }}
 className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ?'border-gray-300 text-gray-900' :'border-transparent text-gray-500 hover:text-gray-700'}`}
 >
 {tab ==='specs' ?'📋 Spesifikasi' : tab ==='reviews' ? `⭐ Ulasan (${reviews.length})` :'🤖 AI Insight'}
 </button>
 ))}
 </div>

 <div className="p-6">
 {/* Specs Tab */}
 {activeTab ==='specs' && (
 <div>
 {product.description && (
 <div className="mb-6">
 <h2 className="font-semibold text-gray-900 mb-2">Deskripsi Produk</h2>
 <p className="text-gray-600 leading-relaxed">{product.description}</p>
 </div>
 )}
 <h2 className="font-semibold text-gray-900 mb-4">Spesifikasi Teknis</h2>
 <SpecTable
 specifications={product.specifications as Record<string, unknown>}
 specFields={category?.specFields}
 />
 </div>
 )}

 {/* Reviews Tab */}
 {activeTab ==='reviews' && (
 <div>
 {/* AI Summary */}
 {reviews.length > 0 && (
 <div className="bg-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
 <div className="flex items-center gap-2 mb-2">
 <span>🤖</span>
 <span className="font-semibold text-gray-700 text-sm">Ringkasan AI</span>
 </div>
 {aiSummaryLoading ? (
 <AILoader text="Menganalisis ulasan..." />
 ) : parsedAiSummary ? (
 <div className="space-y-2 text-sm">
 <p className="text-gray-700">{parsedAiSummary.summary}</p>
 {parsedAiSummary.positives && parsedAiSummary.positives.length > 0 && (
 <div>
 <p className="font-medium text-green-700">✅ Kelebihan:</p>
 <ul className="list-disc list-inside text-gray-600 ml-2">
 {parsedAiSummary.positives.map((p, i) => <li key={i}>{p}</li>)}
 </ul>
 </div>
 )}
 {parsedAiSummary.negatives && parsedAiSummary.negatives.length > 0 && (
 <div>
 <p className="font-medium text-red-700">⚠️ Kekurangan:</p>
 <ul className="list-disc list-inside text-gray-600 ml-2">
 {parsedAiSummary.negatives.map((n, i) => <li key={i}>{n}</li>)}
 </ul>
 </div>
 )}
 {parsedAiSummary.recommendation && (
 <p className="text-gray-900 font-medium">💡 {parsedAiSummary.recommendation}</p>
 )}
 </div>
 ) : (
 <button onClick={handleGetAISummary} className="text-sm text-gray-700 hover:underline">
 Analisis ulasan dengan AI
 </button>
 )}
 </div>
 )}

 {/* Review Form */}
 {isLoggedIn() ? (
 <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-xl">
 <h3 className="font-semibold text-gray-900 mb-3">Tulis Ulasan</h3>
 <div className="mb-3">
 <label className="text-sm text-gray-600 mb-1 block">Rating Anda</label>
 <RatingStars rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
 </div>
 <textarea
 value={reviewComment}
 onChange={(e) => setReviewComment(e.target.value)}
 placeholder="Bagikan pengalaman Anda dengan produk ini..."
 rows={3}
 required
 className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white resize-none mb-3"
 />
 <button
 type="submit"
 disabled={isSubmittingReview}
 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
 >
 {isSubmittingReview ?'Mengirim...' :'Kirim Ulasan'}
 </button>
 </form>
 ) : (
 <div className="text-center py-4 mb-6">
 <Link href="/auth/login" className="text-gray-900 hover:underline text-sm">
 Masuk untuk menulis ulasan
 </Link>
 </div>
 )}

 {/* Review List */}
 <div className="space-y-4">
 {reviews.length === 0 ? (
 <p className="text-center text-gray-500 py-8">Belum ada ulasan. Jadilah yang pertama!</p>
 ) : (
 reviews.map((review) => (
 <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-medium text-sm shrink-0">
 {review.user.name?.[0]?.toUpperCase()}
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className="font-medium text-sm text-gray-900">{review.user.name}</span>
 <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
 </div>
 <div className="flex items-center gap-1 mb-1">
 {[1,2,3,4,5].map((s) => (
 <Star key={s} className={`w-3 h-3 ${s <= review.rating ?'text-yellow-400 fill-yellow-400' :'text-gray-200'}`} />
 ))}
 </div>
 <p className="text-sm text-gray-700">{review.comment}</p>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* AI Tab */}
 {activeTab ==='ai' && (
 <div>
 <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-gray-700" />
 Deskripsi AI
 </h2>
 {aiDescLoading ? (
 <AILoader text="AI sedang membuat deskripsi..." />
 ) : aiDescription ? (
 <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed bg-gray-100 rounded-xl p-5 border border-gray-200">
 <ReactMarkdown>{aiDescription}</ReactMarkdown>
 </div>
 ) : (
 <div className="text-center py-8">
 <p className="text-gray-500 mb-3">Deskripsi AI belum tersedia untuk produk ini.</p>
 <button
 onClick={handleGetAIDescription}
 className="px-4 py-2 bg-gray-100 hover:bg-gray-100 text-white text-sm rounded-lg transition-colors"
 >
 Generate Deskripsi AI
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
