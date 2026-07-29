'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/auth';
import { Sparkles, Plus, X, Scale } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { AILoader } from '@/components/ui/Loader';
import toast from 'react-hot-toast';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [comparison, setComparison] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
    const fetchProducts = async () => {
      const fetchedProducts = await Promise.allSettled(
        ids.slice(0, 3).map((id) => api.get(`/api/products/${id}`))
      );
      const products = fetchedProducts
        .filter((r) => r.status === 'fulfilled')
        .map((r) => (r as PromiseFulfilledResult<{data: {data: Product}}> ).value.data.data);
      setSelectedProducts(products);
    };
    if (ids.length > 0) fetchProducts();
  }, [searchParams]);

  useEffect(() => {
    const fetchAll = async () => {
      const res = await api.get('/api/products', { params: { limit: 50, search: searchQuery } });
      setAllProducts(res.data.data);
    };
    fetchAll();
  }, [searchQuery]);

  const addProduct = (product: Product) => {
    if (selectedProducts.length >= 3) {
      toast.error('Maksimal 3 produk yang bisa dibandingkan');
      return;
    }
    if (selectedProducts.find((p) => p._id === product._id)) {
      toast.error('Produk sudah ada di daftar perbandingan');
      return;
    }
    setSelectedProducts((prev) => [...prev, product]);
    setComparison('');
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== id));
    setComparison('');
  };

  const handleCompare = async () => {
    if (selectedProducts.length < 2) {
      toast.error('Pilih minimal 2 produk untuk dibandingkan');
      return;
    }
    setIsComparing(true);
    try {
      const res = await api.post('/api/ai/compare', {
        productIds: selectedProducts.map((p) => p._id),
      });
      setComparison(res.data.data.comparison);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Layanan AI tidak tersedia');
    } finally {
      setIsComparing(false);
    }
  };

  // Collect all spec keys
  const allSpecKeys = Array.from(
    new Set(
      selectedProducts.flatMap((p) => {
        const specs = p.specifications instanceof Map
          ? Object.keys(Object.fromEntries(p.specifications))
          : Object.keys(p.specifications || {});
        return specs;
      })
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Bandingkan Produk
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pilih 2-3 produk dan biarkan AI menganalisis perbandingannya</p>
        </div>

        {/* Selected Products */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {selectedProducts.map((product) => {
            const cat = typeof product.category === 'object' ? product.category as Category : null;
            return (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 relative">
                <button
                  onClick={() => removeProduct(product._id)}
                  className="absolute top-3 right-3 w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden mb-3">
                  {product.images?.[0] ? (
                    <Image src={getImageUrl(product.images[0])} alt={product.name} fill className="object-contain p-3"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">📦</div>
                  )}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">{cat?.icon} {cat?.name}</p>
                <Link href={`/catalog/${product._id}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-blue-600 line-clamp-2 block mb-1">
                  {product.name}
                </Link>
                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price)}</p>
              </div>
            );
          })}

          {selectedProducts.length < 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center justify-center gap-2 min-h-[200px]">
              <Plus className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Tambah produk {selectedProducts.length + 1}
              </p>
            </div>
          )}
        </div>

        {/* Compare Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCompare}
            disabled={selectedProducts.length < 2 || isComparing}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {isComparing ? 'AI Sedang Menganalisis...' : 'Bandingkan dengan AI'}
          </button>
        </div>

        {/* AI Comparison Result */}
        {isComparing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8 text-center">
            <AILoader text="AI sedang menganalisis perbandingan produk..." />
          </div>
        )}

        {comparison && !isComparing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-purple-100 dark:border-purple-800 p-6 mb-8">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Analisis AI
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              <ReactMarkdown>{comparison}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Spec Comparison Table */}
        {selectedProducts.length >= 2 && allSpecKeys.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
            <h2 className="font-bold text-gray-900 dark:text-white p-4 border-b border-gray-100 dark:border-gray-700">
              Perbandingan Spesifikasi
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium w-1/4">Spesifikasi</th>
                    {selectedProducts.map((p) => (
                      <th key={p._id} className="text-left px-4 py-3 text-gray-900 dark:text-white font-medium">
                        {p.name.split(' ').slice(0, 3).join(' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Harga</td>
                    {selectedProducts.map((p) => (
                      <td key={p._id} className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{formatPrice(p.price)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Rating</td>
                    {selectedProducts.map((p) => (
                      <td key={p._id} className="px-4 py-3 text-gray-900 dark:text-white">{p.avgRating}/5 ⭐</td>
                    ))}
                  </tr>
                  {allSpecKeys.map((key, idx) => (
                    <tr key={key} className={`border-t border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-700/30'}`}>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                      {selectedProducts.map((p) => {
                        const specs = p.specifications instanceof Map
                          ? Object.fromEntries(p.specifications)
                          : (p.specifications as Record<string, unknown> || {});
                        const val = specs[key];
                        return (
                          <td key={p._id} className="px-4 py-3 text-gray-900 dark:text-white">
                            {val !== undefined && val !== null ? String(val) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Search to Add */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Tambah Produk untuk Dibandingkan</h2>
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 mb-3 bg-gray-50 dark:bg-gray-700"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {allProducts
              .filter((p) => !selectedProducts.find((s) => s._id === p._id))
              .slice(0, 20)
              .map((p) => (
                <button
                  key={p._id}
                  onClick={() => addProduct(p)}
                  className="text-left p-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-0.5">{p.name}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{formatPrice(p.price)}</p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Memuat...</div>}>
      <CompareContent />
    </Suspense>
  );
}
