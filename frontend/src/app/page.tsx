'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import {
  Sparkles, ArrowRight, Cpu, Search, ChevronRight, Bot
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
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Didukung Teknologi AI Ollama</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Temukan Elektronik<br /><span className="text-blue-300">Impian Anda</span>
          </h1>
          <p className="text-lg text-blue-200 mb-10 max-w-2xl mx-auto">
            Katalog lengkap produk elektronik dengan AI assistant untuk membantu Anda memilih produk yang tepat.
          </p>
          <form onSubmit={handleSmartSearch} className="max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                <input
                  type="text"
                  value={smartSearchQuery}
                  onChange={(e) => setSmartSearchQuery(e.target.value)}
                  placeholder="Cari dengan AI: HP gaming murah untuk pelajar..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <button type="submit" disabled={isSmartSearching} className="px-6 py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-70 text-white font-medium rounded-2xl transition-colors flex items-center gap-2 shrink-0">
                {isSmartSearching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                {isSmartSearching ? 'Mencari...' : 'Cari AI'}
              </button>
            </div>
          </form>
          <div className="flex flex-wrap justify-center gap-3 mt-5 text-sm text-blue-300">
            {['HP gaming di bawah 5 juta', 'laptop tipis untuk kerja', 'earphone wireless terbaik'].map((hint) => (
              <button key={hint} onClick={() => setSmartSearchQuery(hint)} className="hover:text-white transition-colors">→ {hint}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kategori Produk</h2>
          <Link href="/catalog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">Lihat semua <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/catalog?category=${cat.slug}`} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all group">
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-400" />Produk Unggulan</h2>
              <Link href="/catalog?featured=true" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">Lihat semua <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (<ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />))}
            </div>
          </div>
        </section>
      )}

      {/* AI Features */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fitur AI ElektroniKu</h2>
          <p className="text-gray-500 dark:text-gray-400">Teknologi kecerdasan buatan untuk pengalaman belanja yang lebih pintar</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🤖', title: 'AI Product Assistant', desc: 'Tanya apa saja tentang produk elektronik secara natural.', href: '/ai-assistant', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
            { icon: '⚖️', title: 'AI Perbandingan Produk', desc: 'Bandingkan 2-3 produk dengan analisis mendalam dari AI.', href: '/compare', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
            { icon: '📝', title: 'AI Review Summarizer', desc: 'Ringkasan ulasan pengguna secara otomatis oleh AI.', href: '/catalog', color: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
          ].map((f) => (
            <Link key={f.title} href={f.href} className={`${f.color} border rounded-2xl p-6 hover:shadow-md transition-shadow`}>
              <span className="text-4xl block mb-3">{f.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{f.desc}</p>
              <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">Coba sekarang <ArrowRight className="w-4 h-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Produk Terbaru</h2>
            <Link href="/catalog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">Lihat semua <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestProducts.map((p) => (<ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <Cpu className="w-12 h-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Siap Menemukan Elektronik Impian?</h2>
          <p className="text-blue-200 mb-6 max-w-xl mx-auto">Jelajahi ribuan produk dengan bantuan AI. Dapatkan rekomendasi yang sesuai kebutuhan dan budget Anda.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/catalog" className="px-6 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors">Jelajahi Katalog</Link>
            <Link href="/ai-assistant" className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-colors">Tanya AI Assistant</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
