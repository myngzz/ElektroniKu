'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Cart as CartType } from '@/types';
import Loader from '@/components/ui/Loader';
import { formatPrice, isLoggedIn } from '@/lib/auth';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/cart');
      return;
    }
    fetchCart();
  }, [router]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart');
      setCart(res.data.data);
    } catch {
      toast.error('Gagal memuat keranjang');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQty = async (productId: string, qty: number) => {
    try {
      const res = await api.put(`/api/cart/${productId}`, { qty });
      setCart(res.data.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal update keranjang');
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const res = await api.delete(`/api/cart/${productId}`);
      setCart(res.data.data);
      toast.success('Item dihapus dari keranjang');
    } catch {
      toast.error('Gagal menghapus item');
    }
  };

  if (isLoading) return <Loader text="Memuat keranjang..." />;

  const items = cart?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          Keranjang Belanja
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <ShoppingCart className="w-16 h-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Keranjang Anda masih kosong</p>
            <Link href="/catalog" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.product._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4">
                  <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0">
                    {item.product.images?.[0] ? (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-2xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/catalog/${item.product._id}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 line-clamp-2 text-sm block mb-1">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-500 mb-2">{item.product.brand}</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-3">{formatPrice(item.product.price)}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button
                          onClick={() => updateQty(item.product._id, item.qty - 1)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.product._id, item.qty + 1)}
                          disabled={item.qty >= item.product.stock}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-fit sticky top-20">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cart?.totalItems} item)</span>
                  <span>{formatPrice(cart?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Ongkos kirim</span>
                  <span className="text-green-600">Gratis</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(cart?.subtotal || 0)}</span>
                </div>
              </div>
              <Link
                href="/orders/checkout"
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/catalog" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-3">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
