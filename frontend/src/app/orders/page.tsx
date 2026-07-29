'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Order } from '@/types';
import { isLoggedIn } from '@/lib/auth';
import { formatPrice, formatDate } from '@/lib/auth';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  shipped: { label: 'Dikirim', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  delivered: { label: 'Diterima', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/auth/login?redirect=/orders');
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders');
        setOrders(res.data.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  if (isLoading) return <Loader text="Memuat pesanan..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Pesanan Saya
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada pesanan</p>
            <Link href="/catalog" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusLabel[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-400">+{order.items.length - 3} produk lainnya</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Total Pembayaran</p>
                      <p className="font-bold text-gray-900 dark:text-white">{formatPrice(order.total)}</p>
                    </div>
                    <Link href={`/orders/${order._id}`} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Detail <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
