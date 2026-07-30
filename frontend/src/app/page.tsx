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
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero */}
      <section className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-4">Katalog Elektronik Terpercaya</p>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">
            Temukan Elektronik<br />Impian Anda
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-base sm:text-lg max-w-xl mx-auto">
            Katalog lengkap &middot; Spesifikasi detail &middot; Dibantu AI
          </p>
          <form onSubmit={handleSmartSearch} className="flex gap-0 max-w-xl mx-auto border border-gray-200 dark:border-gray-700">
            <div className="relative flex-1">
              <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={smartSearchQuery}
                onChange={(e) => setSmartSearchQuery(e.target.value)}
                placeholder="Cari dengan AI: laptop gaming murah..."
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none"
              />
            </div>
            <button type="submit" disabled={isSmartSearching} className="px-6 py-3.5 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 disabled:opacity-60 text-white dark:text-gray-900 text-sm font-medium transition-colors flex items-center gap-2 shrink-0">
              {isSmartSearching ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
              Cari
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['HP gaming di bawah 5 juta', 'laptop tipis untuk kerja', 'earphone wireless terbaik'].map((hint) => (
              <button key={hint} onClick={() => setSmartSearchQuery(hint)} className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 px-3 py-1.5 transition-colors">
                {hint}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">Kategori</p>
          <Link href="/catalog" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">Lihat semua <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/catalog?category=${cat.slug}`} className="flex flex-col items-center gap-2 p-5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group text-center">
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="border-y border-gray-100 dark:border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Produk Unggulan
              </p>
              <Link href="/catalog?featured=true" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">Lihat semua <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800">
              {featuredProducts.map((p) => (<ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />))}
            </div>
          </div>
        </section>
      )}

      {/* AI Features */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-6">Fitur AI</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800">
          {[
            { icon: '🤖', title: 'AI Assistant', desc: 'Tanya apa saja tentang produk elektronik.', href: '/ai-assistant' },
            { icon: '⚖️', title: 'Bandingkan Produk', desc: 'Analisis mendalam perbandingan 2–3 produk.', href: '/compare' },
            { icon: '📝', title: 'Ringkas Review', desc: 'Rangkuman ulasan pengguna oleh AI.', href: '/catalog' },
          ].map((f) => (
            <Link key={f.title} href={f.href} className="flex gap-4 items-start p-6 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{f.desc}</p>
                <span className="text-xs text-gray-900 dark:text-white flex items-center gap-1 font-medium">Coba <ArrowRight className="w-3 h-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">Produk Terbaru</p>
            <Link href="/catalog" className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">Lihat semua <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-gray-800">
            {latestProducts.map((p) => (<ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-4">Siap Berbelanja?</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Jelajahi {'>'}60 Produk Elektronik</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm max-w-md mx-auto">Rekomendasi sesuai kebutuhan dan budget dengan bantuan AI.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/catalog" className="px-6 py-3 bg-gray-900 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium transition-colors text-sm">Jelajahi Katalog</Link>
            <Link href="/ai-assistant" className="px-6 py-3 border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-sm">Tanya AI</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
