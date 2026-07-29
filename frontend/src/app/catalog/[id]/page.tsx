'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, Review, Category } from '@/types';
import SpecTable from '@/components/product/SpecTable';
import RatingStars from '@/components/ui/RatingStars';
import Loader, { AILoader } from '@/components/ui/Loader';
import { formatPrice, formatDate, isLoggedIn } from '@/lib/auth';
import {
  ShoppingCart, Heart, Share2, ChevronLeft, Star,
  Sparkles, ArrowRight, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

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
  const [addingToCart, setAddingToCart] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // AI states
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'ai'>('specs');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewRes] = await Promise.allSettled([
          api.get(`/api/products/${id}`),
          api.get(`/api/products/${id}/reviews`),
        ]);

        if (productRes.status === 'fulfilled') {
          setProduct(productRes.value.data.data);
        } else {
          toast.error('Produk tidak ditemukan');
          router.push('/catalog');
        }
        if (reviewRes.status === 'fulfilled') {
          setReviews(reviewRes.value.data.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/catalog/' + id);
      return;
    }
    setAddingToCart(true);
    try {
      await api.post('/api/cart', { productId: id, qty: 1 });
      toast.success('Produk ditambahkan ke keranjang!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menambah ke keranjang');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/catalog/' + id);
      return;
    }
    try {
      await api.post('/api/wishlist', { productId: id });
      toast.success('Ditambahkan ke wishlist!');
    } catch {
      toast.error('Gagal menambah ke wishlist');
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
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
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

  const category = typeof product.category === 'object' ? product.category as Category : null;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images?.length > 0 ? product.images : [''];

  let parsedAiSummary: { summary?: string; positives?: string[]; negatives?: string[]; recommendation?: string; sentimentScore?: number; reviewCount?: number } | null = null;
  try {
    if (aiSummary) parsedAiSummary = JSON.parse(aiSummary);
  } catch { /* ignore */ }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/catalog" className="flex items-center gap-1 hover:text-blue-600">
            <ChevronLeft className="w-4 h-4" /> Katalog
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/catalog?category=${category.slug}`} className="hover:text-blue-600">{category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-3">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='80'%3E📦%3C/text%3E%3C/svg%3E";
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
                    className={`relative w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-colors ${selectedImage === i ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
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
              <Link href={`/catalog?category=${category.slug}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-1 block">
                {category.icon} {category.name}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-3">{product.brand}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={product.avgRating} size="md" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.avgRating}/5 ({product.reviewCount} ulasan)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice!)}</span>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold px-2 py-0.5 rounded-lg">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <Package className="w-4 h-4 text-gray-400" />
              {product.stock > 0 ? (
                <span className={product.stock <= 5 ? 'text-orange-500 font-medium' : 'text-green-600 dark:text-green-400'}>
                  {product.stock <= 5 ? `Sisa ${product.stock} unit!` : `Stok tersedia (${product.stock} unit)`}
                </span>
              ) : (
                <span className="text-red-500 font-medium">Stok habis</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {addingToCart ? 'Menambahkan...' : product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
              <button
                onClick={handleAddToWishlist}
                className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link disalin!'); }}
                className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Compare Link */}
            <Link href={`/compare?ids=${id}`} className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:underline">
              <Sparkles className="w-4 h-4" />
              Bandingkan dengan produk lain
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {(['specs', 'reviews', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); if (tab === 'ai') handleGetAIDescription(); if (tab === 'reviews' && reviews.length > 0) handleGetAISummary(); }}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {tab === 'specs' ? '📋 Spesifikasi' : tab === 'reviews' ? `⭐ Ulasan (${reviews.length})` : '🤖 AI Insight'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Specs Tab */}
            {activeTab === 'specs' && (
              <div>
                {product.description && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Deskripsi Produk</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
                  </div>
                )}
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Spesifikasi Teknis</h2>
                <SpecTable
                  specifications={product.specifications as Record<string, unknown>}
                  specFields={category?.specFields}
                />
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {/* AI Summary */}
                {reviews.length > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span>🤖</span>
                      <span className="font-semibold text-purple-700 dark:text-purple-400 text-sm">Ringkasan AI</span>
                    </div>
                    {aiSummaryLoading ? (
                      <AILoader text="Menganalisis ulasan..." />
                    ) : parsedAiSummary ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">{parsedAiSummary.summary}</p>
                        {parsedAiSummary.positives && parsedAiSummary.positives.length > 0 && (
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">✅ Kelebihan:</p>
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-2">
                              {parsedAiSummary.positives.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>
                        )}
                        {parsedAiSummary.negatives && parsedAiSummary.negatives.length > 0 && (
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">⚠️ Kekurangan:</p>
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-2">
                              {parsedAiSummary.negatives.map((n, i) => <li key={i}>{n}</li>)}
                            </ul>
                          </div>
                        )}
                        {parsedAiSummary.recommendation && (
                          <p className="text-blue-700 dark:text-blue-400 font-medium">💡 {parsedAiSummary.recommendation}</p>
                        )}
                      </div>
                    ) : (
                      <button onClick={handleGetAISummary} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                        Analisis ulasan dengan AI
                      </button>
                    )}
                  </div>
                )}

                {/* Review Form */}
                {isLoggedIn() ? (
                  <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tulis Ulasan</h3>
                    <div className="mb-3">
                      <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Rating Anda</label>
                      <RatingStars rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Bagikan pengalaman Anda dengan produk ini..."
                      rows={3}
                      required
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 resize-none mb-3"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 mb-6">
                    <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">
                      Masuk untuk menulis ulasan
                    </Link>
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada ulasan. Jadilah yang pertama!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm shrink-0">
                            {review.user.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900 dark:text-white">{review.user.name}</span>
                              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Deskripsi AI
                </h2>
                {aiDescLoading ? (
                  <AILoader text="AI sedang membuat deskripsi..." />
                ) : aiDescription ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-100 dark:border-purple-800">
                    <ReactMarkdown>{aiDescription}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-3">Deskripsi AI belum tersedia untuk produk ini.</p>
                    <button
                      onClick={handleGetAIDescription}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
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
