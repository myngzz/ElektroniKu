'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import {
  Sparkles, ArrowRight, Search, ChevronRight, Bot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [smartSearchQuery, setSmartSearchQuery] = useState('');
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const [featuredRes, catRes, latestRes] = await Promise.allSettled([
        api.get('/api/products', { params: { featured: 'true', limit: 4 } }),
        api.get('/api/categories'),
        api.get('/api/products', { params: { limit: 8, sort: 'createdAt' } }),
      ]);
      if (featuredRes.status === 'fulfilled') setFeaturedProducts(featuredRes.value.data.data);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data.data);
      if (latestRes.status === 'fulfilled') setLatestProducts(latestRes.value.data.data);
    };
    fetchData();
  }, []);

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartSearchQuery.trim()) return;
    setIsSmartSearching(true);
    try {
      await api.post('/api/ai/smart-search', { query: smartSearchQuery });
      router.push(`/catalog?search=${encodeURIComponent(smartSearchQuery)}`);
    } catch {
      router.push(`/catalog?search=${encodeURIComponent(smartSearchQuery)}`);
    } finally {
      setIsSmartSearching(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    try {
      await api.post('/api/cart', { productId: product._id, qty: 1 });
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch {
      toast.error('Gagal menambah ke keranjang');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero — clean minimal */}
      <section className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
            Temukan Elektronik <span className="text-blue-600">Impian Anda</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-base sm:text-lg">
            Katalog lengkap · Spesifikasi detail · Dibantu AI
          </p>
          <form onSubmit={handleSmartSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={smartSearchQuery}
                onChange={(e) => setSmartSearchQuery(e.target.value)}
                placeholder="Cari dengan AI: HP gaming murah untuk pelajar..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" disabled={isSmartSearching} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shrink-0">
              {isSmartSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
              Cari
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['HP gaming di bawah 5 juta', 'laptop tipis untuk kerja', 'earphone wireless terbaik'].map((hint) => (
              <button key={hint} onClick={() => setSmartSearchQuery(hint)} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors">
                {hint}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategori</h2>
          <Link href="/catalog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">Lihat semua <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/catalog?category=${cat.slug}`} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition-all group text-center">
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/40 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Produk Unggulan
              </h2>
              <Link href="/catalog?featured=true" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">Lihat semua <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (<ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />))}
            </div>
          </div>
        </section>
      )}

      {/* AI Features */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Fitur AI</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🤖', title: 'AI Assistant', desc: 'Tanya apa saja tentang produk elektronik.', href: '/ai-assistant' },
            { icon: '⚖️', title: 'Bandingkan Produk', desc: 'Analisis mendalam perbandingan 2–3 produk.', href: '/compare' },
            { icon: '📝', title: 'Ringkas Review', desc: 'Rangkuman ulasan pengguna oleh AI.', href: '/catalog' },
          ].map((f) => (
            <Link key={f.title} href={f.href} className="flex gap-4 items-start p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all">
              <span className="text-3xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{f.desc}</p>
                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">Coba <ArrowRight className="w-3 h-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="bg-gray-50 dark:bg-gray-900/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Produk Terbaru</h2>
            <Link href="/catalog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">Lihat semua <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestProducts.map((p) => (<ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Siap Menemukan Elektronik Impian?</h2>
          <p className="text-blue-100 mb-5 text-sm">Jelajahi {'>'}60 produk dengan bantuan AI — rekomendasi sesuai kebutuhan dan budget.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/catalog" className="px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm">Jelajahi Katalog</Link>
            <Link href="/ai-assistant" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors text-sm">Tanya AI</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
