'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { Product } from '@/types';
import { isLoggedIn, formatPrice } from '@/lib/auth';
import { Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/wishlist');
      return;
    }
    fetchWishlist();
  }, [router]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/api/wishlist');
      setProducts(res.data.data.products || []);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await api.delete(`/api/wishlist/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Dihapus dari wishlist');
    } catch {
      toast.error('Gagal menghapus dari wishlist');
    }
  };

  if (isLoading) return <Loader text="Memuat wishlist..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-red-500" />
          Wishlist Saya
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <Heart className="w-16 h-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Wishlist Anda masih kosong</p>
            <Link href="/catalog" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">
              Temukan Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-700">
                  <Link href={`/catalog/${product._id}`}>
                    {product.images?.[0] ? (
                      <Image src={getImageUrl(product.images[0])} alt={product.name} fill className="object-contain p-3" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-4xl">📦</div>
                    )}
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-lg text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <Link href={`/catalog/${product._id}`} className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 block mb-1">
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
